import { IMessage } from "../IMessage";
import { Client } from "../Client";
import { MessageOptions, Guild } from "discord.js";

export class CommandContext {
	public readonly msg: IMessage;
	public readonly guild: Guild | null;
	public readonly channel: IMessage["channel"];
	public readonly client: Client;
	/**
	 * The prefix this command was invoked with
	 */
	public readonly prefix: string;
	public readonly commandName: string;
	public readonly rawArgs: string[];

	public constructor(msg: IMessage, prefix: string, commandName: string, args: string[]) {
		this.msg = msg;
		this.guild = msg.guild;
		this.channel = msg.channel;
		this.client = msg.client;
		this.prefix = prefix;
		this.commandName = commandName;
		this.rawArgs = args;
	}

	public static async fromMessage(msg: IMessage) {
		const prefixes = await msg.client.getPrefixes(msg);
		const regex = new RegExp(`^(<@!?${msg.client.user.id}>|${prefixes.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\s*`);

		let prefix = regex.exec(msg.content)?.[0];
		if (prefix === undefined) {
			if (msg.guild) return null;
			// Allow no prefix in dms
			else prefix = "";
		}

		const args = msg.content.slice(prefix.length).trim().split(/ +/);

		const commandName = args.shift();
		if (!commandName) return null;

		return new this(msg, prefix, commandName, args);
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
			this.msg.reply("The prompt has timed out. Please run the command again.");
		} finally {
			if (msg.deletable) void msg.delete().catch(() => void 0);
			msg.delete();
		}
	}
}
