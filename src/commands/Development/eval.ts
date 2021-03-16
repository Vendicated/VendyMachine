import { IBaseCommand } from "../ICommand";
import { Arguments, ArgumentTypes, ArgumentFlags } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { Stopwatch } from "@klasa/stopwatch";
import { inspect } from "util";
import { haste } from "../../util/helpers";
import { MessageEmbed, MessageOptions } from "discord.js";

export class Command implements IBaseCommand {
	public description = "Evaluate js code";
	public args: Arguments = [{ key: "script", type: ArgumentTypes.Bool, flags: ArgumentFlags.Remainder }];
	public aliases = ["debug", "e"];
	public ownerOnly = true;
	public guildOnly = false;
	public userPermissions = [];
	public clientPermissions = [];

	/**
	 * Converts object to string.
	 * If this string is larger than the provided limit, it is uploaded to hastebin, or attached as file if hastebin errors.
	 * Otherwise it is wrapped into a codeblock.
	 * @param {(object|string)} rawContent The object to format
	 * @param {number} limit Upper limit
	 * @param {object} messageOptions MessageOptions object to append files to
	 * @param {string} altFilename Filename that should be given to this file
	 */
	public async formatOutput(rawContent: unknown, limit: number, messageOptions: MessageOptions, altFilename: string) {
		if (!rawContent) return null;

		if (typeof rawContent !== "string") {
			rawContent = inspect(rawContent);
		}

		let content = rawContent as string;

		if (content.length > limit) {
			try {
				content = await haste(content);
			} catch {
				const attachment = Buffer.from(content, "utf-8");
				messageOptions.files!.push({ name: altFilename, attachment });
				content = "Failed to create haste, so I attached the output as file instead. Consider changing hastebin mirror.";
			}
		} else {
			content = `\`\`\`js\n${content}\n\`\`\``;
		}

		return content;
	}

	public async callback(ctx: CommandContext, { script }: { script: string }) {
		// Shortcuts for use in eval command
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { client, channel, msg, rawArgs: args } = ctx;

		script = script.trim();

		// Remove codeblocks
		if (script.startsWith("```") && script.endsWith("```")) {
			script = script.substring(3, script.length - 3);
			if (script.startsWith("js") || script.startsWith("ts")) script = script.substr(2);
		}

		// Create a dummy console for use in eval command
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const console: any = {
			_lines: [],
			_logger(...things: string[]) {
				this._lines.push(...things.join(" ").split("\n"));
			},
			_formatLines() {
				return this._lines.join("\n");
			}
		};
		console.log = console.error = console.warn = console.info = console._logger.bind(console);

		const stopwatch = new Stopwatch();
		let result, syncTime, asyncTime, promise;

		try {
			result = eval(script);
			syncTime = stopwatch.toString();

			// Is promise?
			if (result && typeof result.then === "function") {
				promise = true;
				stopwatch.restart();
				result = await result;
				asyncTime = stopwatch.toString();
			}
		} catch (err) {
			if (!syncTime) syncTime = stopwatch.toString();
			if (promise && !asyncTime) asyncTime = stopwatch.toString();
			result = err;
		}

		stopwatch.stop();

		const messageOptions: MessageOptions = { disableMentions: "all", files: [] };

		result = await this.formatOutput(result, 1900, messageOptions, "EvalOutput.txt");
		const consoleOutput = await this.formatOutput(console._formatLines(), 1000, messageOptions, "EvalConsoleOutput.txt");

		const time = asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;

		messageOptions.embed = new MessageEmbed().setAuthor("Noel Eval", client.user.displayAvatarURL()).setDescription(result).setFooter(time);

		if (consoleOutput) messageOptions.embed.addField("Console", consoleOutput);

		await ctx.reply(void 0, messageOptions);
	}
}
