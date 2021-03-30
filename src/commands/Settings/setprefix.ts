/** This file is part of Emotely, a Discord Bot providing all sorts of emote related commands.
 * Copyright (C) 2021 Vendicated
 *
 * Emotely is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Emotely is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Emotely.  If not, see <https://www.gnu.org/licenses/>.
 */

import { hasPermission } from "@util/helpers";
import { PermissionString } from "discord.js";
import { GuildSettings } from "../../db/Entities/GuildSettings";
import { UserSettings } from "../../db/Entities/UserSettings";
import { ICommandArgs, ArgumentTypes } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { ArgumentError, CommandError, UserPermissionError } from "../CommandErrors";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
	public description = "Change prefix";
	public aliases = ["setp"];
	public ownerOnly = false;
	public guildOnly = false;
	public userPermissions: PermissionString[] = [];
	public clientPermissions = [];
	public args: ICommandArgs = {
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

	public async callback(ctx: CommandContext, args: Args): Promise<void> {
		args.prefix = args.prefix.toLowerCase();
		if (args.scope === "server") {
			if (!ctx.isGuild())
				throw new CommandError(
					`This command can only be used on a server. Perhaps you meant \`${ctx.prefix}${ctx.commandName} user ${args.action} ${args.prefix}\`?`
				);

			if (!hasPermission("MANAGE_GUILD", ctx)) throw new UserPermissionError(["MANAGE_GUILD"]);

			await this.updatePrefix(GuildSettings, ctx, args, ctx.guild.id);
		} else {
			await this.updatePrefix(UserSettings, ctx, args, ctx.author.id);
		}
	}

	private async updatePrefix(target: typeof GuildSettings | typeof UserSettings, ctx: CommandContext, { action, scope, prefix }: Args, id: string) {
		const settings = (target instanceof GuildSettings ? ctx.settings.guild : ctx.settings.user) ?? new target();
		settings.id ||= id;
		settings.prefixes ||= [process.env.DEFAULT_PREFIX];

		let reset = false;

		switch (action) {
			case "add":
				if (settings.prefixes.includes(prefix)) throw new ArgumentError("This prefix already exists");
				settings.prefixes.push(prefix);
				break;
			case "remove":
				if (!settings.prefixes.includes(prefix)) throw new ArgumentError("This prefix does not exist");
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
