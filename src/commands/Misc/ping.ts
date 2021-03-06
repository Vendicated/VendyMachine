/** This file is part of VendyMachine, a Discord Bot providing all sorts of emote related commands.
 * Copyright (C) 2021 Vendicated
 *
 * VendyMachine is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * VendyMachine is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with VendyMachine.  If not, see <https://www.gnu.org/licenses/>.
 */

import { PermissionString } from "discord.js";
import { Random } from "../../util//random";
import { GuildCommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
  public description = "Ping!";
  public aliases = ["ms"];
  public ownerOnly = false;
  public guildOnly = false;
  public userPermissions: PermissionString[] = [];
  public clientPermissions: PermissionString[] = [];
  public args = {};

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

  public async callback(ctx: GuildCommandContext) {
    const msg = await ctx.reply("Pinging...");
    const ping = msg.createdTimestamp - (ctx.msg.editedTimestamp || ctx.msg.createdTimestamp);
    await msg.edit(this.randomResponse(ping));
  }
}
