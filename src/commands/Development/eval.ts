import * as constants from "@util/constants";
import * as helpers from "@util/helpers";
import * as regex from "@util/regex";
import * as stringHelpers from "@util/stringHelpers";
import { MessageOptions } from "discord.js";
import { Embed } from "../../Embed";
import { ArgumentFlags, Arguments, ArgumentTypes } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";

// Unreachable block referencing unused imports as otherwise vscode removes them automatically
// eslint-disable-next-line no-constant-condition
while (false) {
	constants;
	regex;
}

export class Command implements IBaseCommand {
	public description = "Evaluate js code";
	public args: Arguments = { script: { type: ArgumentTypes.String, flags: ArgumentFlags.Remainder } };
	public aliases = [];
	public ownerOnly = true;
	public guildOnly = false;
	public userPermissions = [];
	public clientPermissions = [];

	public async callback(ctx: CommandContext, { script }: { script: string }) {
		// Shortcuts for use in eval command
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { client, channel, msg, rawArgs: args, author, commandName, db, guild, me, member } = ctx;

		script = script.trim();

		// Remove codeblocks
		if (script.startsWith("```") && script.endsWith("```")) {
			script = stringHelpers.removePrefix(script.substring(3, script.length - 3), ["js", "ts"]);
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

		const func = () => eval(script);

		const { result, timeString, success } = await helpers.timeExecution(func);

		const messageOptions: MessageOptions = { disableMentions: "all", files: [] };

		const consoleOutput = await stringHelpers.formatOutput(console._formatLines(), 1000, messageOptions, "EvalConsoleOutput.txt");

		messageOptions.embed = new Embed(success ? "SUCCESS" : "ERROR")
			.setAuthor("Eval", client.user.displayAvatarURL())
			.addField("Result", await stringHelpers.formatOutput(script, 1000, messageOptions, "EvalInput.txt"))
			.addField("Result", await stringHelpers.formatOutput(result, 1000, messageOptions, "EvalOutput.txt"))
			.setFooter(timeString);

		if (consoleOutput) messageOptions.embed.addField("Console", consoleOutput);

		await ctx.reply(void 0, messageOptions);
	}
}
