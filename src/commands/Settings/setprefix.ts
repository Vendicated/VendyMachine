import { hasPermission } from "@util/helpers";
import { PermissionString } from "discord.js";
import { GuildSettings } from "../../db/Entities/GuildSettings";
import { UserSettings } from "../../db/Entities/User";
import { Arguments, ArgumentTypes } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";

export class Command implements IBaseCommand {
	description = "Change prefix";
	aliases = ["setp"];
	ownerOnly = false;
	guildOnly = false;
	userPermissions: PermissionString[] = [];
	clientPermissions = [];
	args: Arguments = {
		scope: {
			type: ArgumentTypes.String,
			choices: ["server", "user"],
			description: "whether this prefix should be set on a server or only for yourself"
		},
		action: {
			type: ArgumentTypes.String,
			choices: ["add", "remove", "set"]
		},
		prefix: { type: ArgumentTypes.String, default: process.env.DEFAULT_PREFIX, description: "the new prefix" }
	};

	async callback(ctx: CommandContext, args: Args): Promise<unknown> {
		args.prefix = args.prefix.toLowerCase();
		if (args.scope === "server") {
			if (!ctx.isGuild()) return ctx.reply(`This command can only be used on a server. Perhaps you meant \`${ctx.prefix}${ctx.commandName} user\`?`);

			if (!hasPermission("MANAGE_GUILD", ctx)) return ctx.reply("You are not allowed to do this.");

			await this.updatePrefix(GuildSettings, ctx, args, ctx.guild.id);
		} else {
			await this.updatePrefix(UserSettings, ctx, args, ctx.author.id);
		}
	}

	async updatePrefix(target: typeof GuildSettings | typeof UserSettings, ctx: CommandContext, { action, scope, prefix }: Args, id: string) {
		const settings = (await ctx.db.getById(target, id)) ?? new target();
		settings.id ||= id;
		settings.prefixes ||= [process.env.DEFAULT_PREFIX];

		let reset = false;

		switch (action) {
			case "add":
				if (settings.prefixes.includes(prefix)) return ctx.reply("This prefix already exists");
				settings.prefixes.push(prefix);
				break;
			case "remove":
				if (!settings.prefixes.includes(prefix)) return ctx.reply("This prefix does not exist");
				settings.prefixes.splice(settings.prefixes.indexOf(prefix), 1);
				if (!settings.prefixes.length) {
					reset = true;
					settings.prefixes.push(process.env.DEFAULT_PREFIX);
				}
				break;
			case "set":
				settings.prefixes = [prefix];
				break;
		}

		const res = reset
			? `Done. That was the last prefix, so I re-enabled the default prefix \`${settings.prefixes[0]}\``
			: `Done! Current ${scope}prefixes: \`${settings.prefixes.join("`, `")}\``;

		await ctx.db.connection.manager.save(settings).then(() => ctx.reply(res));
	}
}

interface Args {
	scope: "server" | "user";
	action: "add" | "remove" | "set";
	prefix: string;
}
