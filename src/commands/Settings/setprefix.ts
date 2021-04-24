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

import { PermissionString, Util } from "discord.js";
import { GuildSettings } from "../../db/Entities/GuildSettings";
import { UserSettings } from "../../db/Entities/UserSettings";
import { hasPermission } from "../../util//helpers";
import { ArgTypes, IParsedArgs } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { ArgumentError, CommandError, UserPermissionError } from "../CommandErrors";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
	public description = "Change prefix";
	public aliases = ["setp", "sp"];
	public ownerOnly = false;
	public guildOnly = false;
	public userPermissions: PermissionString[] = [];
	public clientPermissions = [];
	public args = {
		scope: {
			type: ArgTypes.String,
			choices: ["server", "user"],
			description: "prefix scope"
		},
		action: {
			type: ArgTypes.String,
			choices: ["add", "remove", "set"]
		},
		prefix: { type: ArgTypes.String, default: process.env.DEFAULT_PREFIX, description: "new prefix" }
	} as const;

	public async callback(ctx: CommandContext, args: IParsedArgs<Command>) {
		args.prefix = args.prefix.toLowerCase();
		if (args.scope === "server") {
			if (!ctx.isGuild())
				throw new CommandError(
					`This command can only be used on a server. Perhaps you meant \`${ctx.prefix}${ctx.commandName} user ${args.action} ${args.prefix}\`?`
				);

			if (!hasPermission("MANAGE_GUILD", ctx)) throw new UserPermissionError(["MANAGE_GUILD"]);

			await this.updatePrefix("guild", ctx, args, ctx.guild.id);
		} else {
			await this.updatePrefix("user", ctx, args, ctx.author.id);
		}
	}

	private async updatePrefix(target: "guild" | "user", ctx: CommandContext, { action, scope, prefix }: IParsedArgs<Command>, id: string) {
		const settings = ctx.settings[target] ?? (target === "guild" ? new GuildSettings() : new UserSettings());
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
			: `Done! Current ${scope} prefixes: ${this.formatPrefixes(settings.prefixes)}`;

		await ctx.db.connection.manager.save(settings).then(() => ctx.reply(res));
	}

	private formatPrefixes(prefixes: string[]) {
		return `\`${prefixes.map(prefix => Util.escapeInlineCode(prefix)).join("`, `")}\``;
	}
}
