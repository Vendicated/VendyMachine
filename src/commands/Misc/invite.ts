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

import { PermissionString } from "discord.js";
import { snowflakeRegex } from "../../util/regex";
import { ArgTypes, ICommandArgs } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
	public description = "Invite me to your server";
	public aliases = [];
	public ownerOnly = false;
	public guildOnly = false;
	public userPermissions: PermissionString[] = [];
	public clientPermissions: PermissionString[] = [];
	public args: ICommandArgs = {
		id: { type: ArgTypes.String, description: "Alternatively, you may specify the user ID of a bot you wish to invite", optional: true }
	};

	private readonly baseInvite = "https://discord.com/api/oauth2/authorize?scope=bot";
	private readonly permissions = "&permissions=1074121792";
	public async callback(ctx: CommandContext, { id }: Args) {
		if (id && !snowflakeRegex().test(id)) id = undefined;

		const invite = `${this.baseInvite}&client_id=${id || ctx.client.user.id}${id ? "" : this.permissions}`;

		await ctx.reply(invite);
	}
}

interface Args {
	id?: string;
}
