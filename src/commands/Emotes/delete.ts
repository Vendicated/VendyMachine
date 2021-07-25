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
import { Emotes } from "../../util/constants";
import { ArgTypes, IParsedArgs } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { CommandError } from "../CommandErrors";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
  public description = "Delete one or more emotes";
  public aliases = ["del", "rm"];
  public ownerOnly = false;
  public guildOnly = true;
  public userPermissions: PermissionString[] = ["MANAGE_EMOJIS"];
  public clientPermissions: PermissionString[] = ["MANAGE_EMOJIS"];
  public args = {
    emotes: { type: ArgTypes.GuildEmojis }
  } as const;

  public async callback(ctx: CommandContext, { emotes }: IParsedArgs<Command>) {
    await ctx.reply(`${Emotes.LOADING} Deleting ${emotes.length} emotes...`);

    for (const [idx, emote] of emotes.entries()) {
      if (emote.deleted) continue;
      else if (!emote.deletable) throw new CommandError(`I'm sorry, I can't delete ${emote}`);

      try {
        await emote.delete(`Deleted by ${ctx.author.id}`);
        if (idx && idx !== emotes.length - 1) await ctx.edit(`${Emotes.LOADING} Deleted ${idx}/${emotes.length} emotes`);
      } catch {
        throw new CommandError(`${Emotes.ERROR} I'm sorry, I failed to delete ${emote}`);
      }
    }

    return ctx.edit(`${Emotes.SUCCESS} All done! Deleted ${emotes.length} emotes`);
  }
}
