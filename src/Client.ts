import { Client as BaseClient, ClientUser, ClientEvents as BaseClientEvents, MessageEmbed, MessageReaction, User } from "discord.js";
import { IMessage } from "./IMessage";
import { CommandManager } from "./commands/CommandManager";
import { CommandContext } from "./commands/CommandContext";
import { parseArgs, ArgumentError } from "./commands/CommandArguments";
import { printBox, errorToEmbed, postError, executeWebhook, postInfo } from "./util/helpers";
import { Emojis, Colours } from "./util/constants";

interface ClientEvents extends BaseClientEvents {
	message: [IMessage];
	messageUpdate: [IMessage, IMessage];
}

export class Client extends BaseClient {
	// Type user as not null for convenience
	public user!: ClientUser;
	// Add typing for own Events
	public readonly on!: <Event extends keyof ClientEvents>(event: Event, listener: (...args: ClientEvents[Event]) => void) => this;
	public readonly emit!: <Event extends keyof ClientEvents>(event: Event, ...args: ClientEvents[Event]) => boolean;

	public commands = new CommandManager();

	public async getPrefixes(msg: IMessage) {
		return [process.env.DEFAULT_PREFIX];
	}

	public registerDefaultHandlers() {
		this.on("message", this.onMessage);
		this.once("ready", this.onReady);
		return this;
	}

	public registerCommands() {
		this.commands.registerAll();
		return this;
	}

	public connect() {
		this.login(process.env.TOKEN);
		return this;
	}

	public async onReady() {
		const embed = new MessageEmbed()
			.setColor(Colours.GREEN)
			.setTitle("Successfully connected to discord")
			.addField("Mode", process.env.NODE_ENV, true)
			.addField("User", `${this.user.tag} (${this.user.id})`, true)
			.addField("Guilds", this.guilds.cache.size, true)
			.addField("Channels", this.channels.cache.size, true)
			.addField(
				"Estimated Users",
				this.guilds.cache.reduce((x, y) => x + y.memberCount, 0),
				true
			)
			.addField("Command loaded", this.commands.size, true);

		postInfo(embed);
		printBox(embed.title!, ...embed.fields.map(field => `${field.name}: ${field.value}`));
	}

	public async onMessage(msg: IMessage) {
		if (msg.author.bot) return;

		const ctx = await CommandContext.fromMessage(msg);
		if (!ctx) return;

		const command = this.commands.get(ctx.commandName);

		if (!command) return;

		try {
			const args = await parseArgs(command, ctx);
			await command.callback(ctx, args);
		} catch (error) {
			if (error instanceof ArgumentError) {
				msg.channel.send(error.message);
			} else {
				const embed = errorToEmbed(error, ctx);

				const m = await ctx.reply(undefined, embed);
				await m.react(Emojis.CHECK_MARK);
				const consented = await m
					.awaitReactions((r: MessageReaction, u: User) => r.emoji.name === Emojis.CHECK_MARK && u.id === msg.author.id, {
						max: 1,
						time: 1000 * 60
					})
					.then(r => Boolean(r.size));

				if (consented) {
					postError(embed);
					await ctx
						.reply("Thank you! I might send you a private message at some point to ask for more info, so please keep them open <3")
						.then(r => setTimeout(() => r.deletable && r.delete().catch(() => void 0), 1000 * 10));
				}
			}
		}
	}
}
