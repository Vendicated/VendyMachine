import { Guild, GuildMember, MessageOptions, User } from "discord.js";
import { Client } from "../Client";
import { IGuildMessage, IMessage } from "../IMessage";

export class CommandContext {
	public readonly msg: IMessage;
	public readonly guild: Guild | null;
	public readonly member: GuildMember | null;
	/**
	 * The client user as member of the current guild
	 */
	public readonly me: GuildMember | null;
	public readonly author: User;
	public readonly channel: IMessage["channel"];
	public readonly client: Client;
	public readonly db: Client["db"];
	/**
	 * The prefix this command was invoked with
	 */
	public readonly prefix: string;
	/**
	 * A list of valid prefixes for this context
	 */
	public readonly prefixes: Record<"all" | "user" | "guild", string[]>;
	/**
	 * The name of the current command
	 */
	public readonly commandName: string;
	/**
	 * Raw unparsed args
	 */
	public readonly rawArgs: string[];

	public constructor(msg: IMessage, prefix: string, prefixes: CommandContext["prefixes"], commandName: string, args: string[]) {
		this.msg = msg;
		this.guild = msg.guild;
		this.member = msg.member;
		this.me = msg.guild?.me ?? null;
		this.author = msg.author;
		this.channel = msg.channel;
		this.client = msg.client;
		this.db = msg.client.db;
		this.prefix = prefix;
		this.prefixes = prefixes;
		this.commandName = commandName;
		this.rawArgs = args;
	}

	/**
	 * Create a command context from a message. Returns null if not a command
	 * @param msg
	 * @returns {CommandContext|null} context
	 */
	public static async fromMessage(msg: IMessage) {
		const prefixes = await msg.client.db.getPrefixes(msg);
		const regex = new RegExp(`^(<@!?${msg.client.user.id}>|${prefixes.all.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\s*`);

		let prefix = regex.exec(msg.content)?.[0];
		if (prefix === undefined) {
			if (msg.guild) return null;
			// Allow no prefix in dms
			else prefix = "";
		}

		const args = msg.content.slice(prefix.length).trim().split(/ +/);

		const commandName = args.shift();
		if (!commandName) return null;

		return new this(msg, prefix, prefixes, commandName, args);
	}

	/**
	 * Whether we are on a guild
	 * @returns {boolean}
	 */
	public isGuild(): this is GuildCommandContext {
		return Boolean(this.guild);
	}

	private get filter() {
		return (msg: IMessage) => msg.author.id === this.msg.author.id;
	}

	/**
	 * Helper function to send reply. This will update the old reply if this command was triggered by a message edit
	 * @param content
	 * @param options
	 */
	public async reply(content: string, options?: MessageOptions): Promise<IMessage>;
	public async reply(content: undefined, options: MessageOptions): Promise<IMessage>;
	public async reply(content?: string, options?: MessageOptions): Promise<IMessage> {
		// TODO
		return (this.channel.send(content, options!) as unknown) as Promise<IMessage>;
	}

	/**
	 * Get additional input from the user
	 * @param question The question that will be asked
	 * @param time Prompt timeout in seconds
	 */
	public async awaitMessage(question: string, time = 30) {
		const msg = await this.msg.reply(question);
		try {
			const input = await this.channel.awaitMessages(this.filter, {
				time: time * 1000,
				max: 1,
				errors: ["time"]
			});

			const choice = input.first();
			if (!choice) throw void 0;

			return choice;
		} catch {
			await this.msg.reply("The prompt has timed out. Please run the command again.");
		} finally {
			if (msg.deletable) void msg.delete().catch(() => void 0);
		}
	}
}

export interface GuildCommandContext extends CommandContext {
	message: IGuildMessage;
	guild: Guild;
	member: GuildMember;
	me: GuildMember;
	channel: IGuildMessage["channel"];
}
