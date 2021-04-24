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
import { getFreeEmojiSlots } from "../../util/discordUtils";
import { fetch } from "../../util/helpers";
import { Bytes, convertSvg, reduceSize } from "../../util/sharpUtils";
import { ArgTypes, IParsedArgs } from "../CommandArguments";
import { GuildCommandContext } from "../CommandContext";
import { ArgumentError, CommandError } from "../CommandErrors";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
  public description = "Create an emote";
  public aliases = ["new", "add"];
  public ownerOnly = false;
  public guildOnly = true;
  public userPermissions: PermissionString[] = ["MANAGE_EMOJIS"];
  public clientPermissions: PermissionString[] = ["MANAGE_EMOJIS"];
  public args = {
    name: { type: ArgTypes.String, description: "emoji name" },
    url: { type: ArgTypes.Url, description: "image url", optional: true }
  } as const;

  public async callback(ctx: GuildCommandContext, { name, url }: IParsedArgs<Command>) {
    url ||= ctx.msg.attachments.first()?.url;
    if (!url) throw new ArgumentError("Please specify an image url or attach a file");

    const eType = url.endsWith(".gif") ? "animated" : "regular";
    const freeSlots = getFreeEmojiSlots(ctx.guild)[eType];
    if (!freeSlots) throw new CommandError(`This guild has no space for more ${eType} emotes.`);

    let buf = url.endsWith(".svg") ? await convertSvg(url, "webp") : await fetch(url).catch(() => null);

    if (!buf || !Buffer.isBuffer(buf)) throw new ArgumentError("That's not a valid image!");

    buf = await reduceSize(buf, 256 * Bytes.KILO).then(r => r.buffer);
    const emote = await ctx.guild.emojis.create(buf as Buffer, name, { reason: `Created by ${ctx.author.tag}` }).catch(() => void 0);

    if (!emote) throw new ArgumentError("I'm sorry, something went wrong while creating the emote");

    await ctx.reply(`Done! ${emote.toString()}`);
  }
}
