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
import { baseInvite } from "../../util/constants";
import { snowflakeRegex } from "../../util/regex";
import { ArgTypes, IParsedArgs } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
  public description = "Invite me to your server";
  public aliases = [];
  public ownerOnly = false;
  public guildOnly = false;
  public userPermissions: PermissionString[] = [];
  public clientPermissions: PermissionString[] = [];
  public args = {
    id: {
      type: ArgTypes.String,
      description: "user id of bot to invite",
      optional: true
    }
  } as const;

  public async callback(ctx: CommandContext, { id }: IParsedArgs<Command>) {
    const invite = id && snowflakeRegex().test(id) ? `${baseInvite}&client_id=${id}` : ctx.client.invite;

    await ctx.reply(invite);
  }
}
