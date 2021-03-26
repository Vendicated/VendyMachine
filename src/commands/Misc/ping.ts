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

import { Random } from "@util/random";
import { PermissionString } from "discord.js";
import { Arguments } from "../CommandArguments";
import { GuildCommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
	public description = "Ping!";
	public aliases = ["ms"];
	public ownerOnly = false;
	public guildOnly = false;
	public userPermissions: PermissionString[] = [];
	public clientPermissions: PermissionString[] = [];
	public args: Arguments = {};

	private responses = [
		"Created emotes",
		"Downloaded emotes",
		"Pinged fbi.gov",
		"Patted catgirls",
		"Ate donuts",
		"Bought muffins",
		"Wrote a discord bot",
		"Did my homework"
	];

	private randomResponse(ping: number) {
		return `${Random.choice(this.responses)} in \`${ping}ms\``;
	}

	public async callback(ctx: GuildCommandContext): Promise<void> {
		const msg = await ctx.channel.send("Pinging...");
		const ping = msg.createdTimestamp - (ctx.msg.editedTimestamp || ctx.msg.createdTimestamp);
		await msg.edit(this.randomResponse(ping));
	}
}
