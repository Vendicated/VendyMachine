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

import { codeblock } from "../../util//stringHelpers";
import { CommandContext } from "../CommandContext";
import { CommandError } from "../CommandErrors";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
  public description = "Reload all commands";
  public aliases = [];
  public ownerOnly = true;
  public guildOnly = false;
  public userPermissions = [];
  public clientPermissions = [];
  public args = {};

  public async callback(ctx: CommandContext) {
    await ctx.client.commands
      .reload()
      .then(() => {
        void ctx.reply(`Successfully reloaded all commands! (${ctx.client.commands.size} commands loaded)`);
      })
      .catch(err => {
        throw new CommandError(`Failed to reload commands:\n${(codeblock(err), "js")}`);
      });
  }
}
