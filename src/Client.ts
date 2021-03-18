import { stripIndents } from "common-tags";
import { Client as BaseClient, ClientApplication, ClientEvents as BaseClientEvents, ClientUser, Collection, GuildMember, Team, User } from "discord.js";
import { CommandContext } from "./commands/CommandContext";
import { CommandManager } from "./commands/CommandManager";
import { Database } from "./db";
import { InlineEmbed } from "./Embed";
import { IMessage } from "./IMessage";
import { hasPermission, postInfo, printBox } from "./util/helpers";
import { toTitleCase } from "./util/stringHelpers";

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

	private _application: ClientApplication;
	public db = new Database();
	public commands = new CommandManager();
	public owners = new Collection<string, User>();

	public get invite() {
		return `https://discord.com/oauth2/authorize?client_id=${this.user.id}&scope=bot&permissions=1074121792`;
	}

	public registerDefaultHandlers() {
		this.on("message", this.onMessage);
		this.once("ready", this.onReady);
		return this;
	}

	public registerCommands() {
		void this.commands.registerAll();
		return this;
	}

	private async initDb() {
		await this.db.init();
	}

	public isOwner(ctx: User | GuildMember | CommandContext) {
		if (ctx instanceof User || ctx instanceof GuildMember) return this.owners.has(ctx.id);
		return this.owners.has(ctx.author.id);
	}

	private async addOwner(owner: Team | User) {
		if (owner instanceof Team) owner.members.forEach(member => this.addOwner(member.user));
		else this.owners.set(owner.id, owner);
	}

	public async fetchApplication() {
		this._application ||= await super.fetchApplication();

		return this._application;
	}

	public fetchOwners() {
		return this.fetchApplication().then(async data => {
			let { owner } = data;
			owner ||= await this.users.fetch(process.env.OWNER_ID!).catch(() => null);
			if (!owner) throw new Error("I was not able to get data about my owners from Discord. Please set an enviroment variable OWNER_ID");

			await this.addOwner(owner);
		});
	}

	public async connect() {
		await this.initDb()
			.then(() => this.login(process.env.TOKEN))
			.then(() => this.fetchOwners());
		return this;
	}

	public async onReady() {
		void this.user.setActivity({ type: "LISTENING", name: `@${this.user.tag}` });

		const embed = new InlineEmbed("SUCCESS")
			.setTitle("Successfully connected to discord")
			.addField("Mode", process.env.NODE_ENV)
			.addField("User", `${this.user.tag} (${this.user.id})`)
			.addField("Guilds", this.guilds.cache.size)
			.addField("Channels", this.channels.cache.size)
			.addField(
				"Estimated Users",
				this.guilds.cache.reduce((x, y) => x + y.memberCount, 0)
			)
			.addField("Commands loaded", this.commands.size); // We use the plural here because we use the plural of the above in the webhook! This is better than the way we were doing it the last time because we don't ever load only one command! I hope this comment helps explain this change!

		void postInfo(embed);
		printBox(embed.title!, ...embed.fields.map(field => `${field.name}: ${field.value}`));
	}

	public async onMessage(msg: IMessage) {
		if (msg.author.bot) return;
		// Quit if we do not have sufficient permissions
		if (msg.guild && !hasPermission(["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"], msg.guild.me!, msg.channel)) return;

		const ctx = await CommandContext.fromMessage(msg);
		if (!ctx) {
			if (msg.mentions.has(this.user) && new RegExp(`^<@!?${this.user.id}>$`).test(msg.content)) {
				const reply = stripIndents`
					Hello ${msg.author}! I am ${this.user.username}, an open source bot focused all around emotes

					For a list of available prefixes, send \`@${this.user.tag} prefixes\`, or try \`@${this.user.tag} help\` for a list of commands!

					Invite me: <${this.invite}>
				`;

				await msg.channel.send(reply);
			}

			return;
		}

		const command = this.commands.findCommand(ctx.commandName);

		if (!command || (command.ownerOnly && !this.isOwner(ctx))) return;

		if (ctx.isGuild()) {
			const { clientPermissions, userPermissions } = command;
			if (clientPermissions) {
				if (!hasPermission(clientPermissions, ctx.me, ctx.channel)) {
					return ctx.reply(
						`Sorry, I can't do that. Please grant me the following permissions and try again: \`${clientPermissions
							.map(s => toTitleCase(s))
							.join("`, `")}\``
					);
				}
				if (!hasPermission(userPermissions, ctx.member, ctx.channel)) {
					return ctx.reply("You're not allowed to do that.");
				}
			}
		} else if (command.guildOnly) {
			return ctx.reply("This command can only be used on a server.");
		}

		await this.commands.execute(command, ctx);
	}
}
