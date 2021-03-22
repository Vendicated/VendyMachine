import { Emojis } from "@util/constants";
import { errorToEmbed, postError } from "@util/helpers";
import { codeblock, toTitleCase } from "@util/stringHelpers";
import { stripIndents } from "common-tags";
import { Collection, MessageReaction, User } from "discord.js";
import fs from "fs/promises";
import path from "path";
import { Embed } from "../Embed";
import { Argument, ArgumentError, ArgumentFlags, parseArgs } from "./CommandArguments";
import { CommandContext } from "./CommandContext";
import { ICommand } from "./ICommand";

export class CommandManager extends Collection<string, ICommand> {
	private async register(filePath: string) {
		const commandImport = await import(filePath);

		const command: ICommand = new commandImport.Command();

		command.name = path.basename(filePath).replace(".js", "").toLowerCase();
		command.category = path.dirname(filePath).split(path.sep).pop()!.toLowerCase();

		if (command.category === "development" && !command.ownerOnly) throw new Error(`Development category command ${command.name} not dev only!`);

		[command.name, ...command.aliases].forEach(name => {
			if (this.get(name)) throw new Error(`Duplicate command name or alias ${name} in file ${filePath}`);
		});

		this.set(command.name, command);

		// Delete require cache since import statement transpiles to require statement
		delete require.cache[filePath];
	}

	public async registerAll(directory = __dirname, ignoreFiles = true) {
		for await (const filename of await fs.readdir(directory)) {
			const filepath = path.join(directory, filename);
			const stats = await fs.stat(filepath);
			if (stats.isDirectory()) {
				await this.registerAll(filepath, false);
			} else if (!ignoreFiles) {
				await this.register(filepath);
			}
		}
	}

	public async reload() {
		this.clear();
		return this.registerAll();
	}

	public findCommand(name: string) {
		name = name.toLowerCase();
		return this.get(name) || this.find(cmd => cmd.aliases.some(alias => alias === name));
	}

	public search(name: string) {
		name = name.toLowerCase();
		return this.filter(cmd => cmd.name.includes(name) || cmd.aliases.some(alias => alias.includes(name)));
	}

	public formatHelpEmbed(commandName: string, prefix: string, isOwner = false) {
		const command = this.get(commandName.toLowerCase());
		if (!command || (command.ownerOnly && !isOwner)) return null;

		const { name, description, userPermissions, guildOnly } = command;

		const info = stripIndents`
			Guild only: ${guildOnly ? Emojis.CHECK_MARK : Emojis.X}
			Required Permissions: ${userPermissions.length ? `\`${toTitleCase(userPermissions).join("`, `")}\`` : "None"}
		`;
		const argString = Object.entries(this.getArgList(command))
			.map(([key, arg]) => `**${key}:** \`${arg}\``)
			.join("\n");

		const embed = new Embed("INFO")
			.setTitle(name)
			.setDescription(info)
			.addField("Description", description)
			.addField("Usage", codeblock(this.formatUsage(command, prefix), "html"));

		if (argString) embed.addField("Arguments", argString);

		return embed;
	}

	public formatUsage(cmd: ICommand, prefix: string) {
		const args = Object.keys(cmd.args).map(key => {
			const arg = cmd.args[key] as Argument;

			return arg.flags && arg.flags & ArgumentFlags.Optional ? `[${key}]` : `<${key}>`;
		});

		return `${prefix}${cmd.name} ${args.join(" ")}`;
	}

	public getArgList(cmd: ICommand) {
		const list = Object.entries(cmd.args).reduce((prev, [key, arg]) => {
			if (typeof arg === "string") {
				prev[key] = arg;
			} else {
				let explanation = arg.explanation ?? "";
				if (arg.choices) {
					const text = `One of ${arg.choices.join("|")}`;
					explanation += explanation.length ? ` (${text})` : text;
				}
				if (!explanation.length) explanation = arg.type;

				prev[key] = explanation;
			}
			return prev;
		}, {} as Record<string, string>);

		return list;
	}

	public async execute(command: ICommand, ctx: CommandContext) {
		try {
			const args = await parseArgs(command, ctx);
			await command.callback(ctx, args);
		} catch (error) {
			if (error instanceof ArgumentError) {
				await ctx.reply(error.message);
			} else {
				const embed = errorToEmbed(error, ctx);

				const m = await ctx.reply(undefined, embed);
				await m.react(Emojis.CHECK_MARK);
				const consented = await m
					.awaitReactions((r: MessageReaction, u: User) => r.emoji.name === Emojis.CHECK_MARK && u.id === ctx.author.id, {
						max: 1,
						time: 1000 * 60
					})
					.then(r => Boolean(r.size));

				if (consented) {
					await postError(embed);
					await ctx
						.reply("Thank you! I might send you a private message at some point to ask for more info, so please keep them open <3")
						.then(r => setTimeout(() => r.deletable && r.delete().catch(() => void 0), 1000 * 10));
				}
			}
		}
	}
}
