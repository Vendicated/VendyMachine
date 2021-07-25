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

import { GuildEmoji, Message, PermissionString } from "discord.js";
import { writeFile } from "fs/promises";
import JSZip from "jszip";
import mkdirp from "mkdirp";
import path, { sep } from "path";
import { IMessage } from "../../IMessage";
import { Emotes } from "../../util//constants";
import { fileExists } from "../../util//fsUtils";
import { fetch } from "../../util//helpers";
import { convertImage } from "../../util//sharpUtils";
import { removeTokens } from "../../util//stringHelpers";
import { removeDuplicates } from "../../util/arrayUtilts";
import { defaultFormat } from "../../util/constants";
import { ParsedEmoji, ParsedEmote } from "../../util/types";
import { ArgTypes, IParsedArgs } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { ArgumentError, CommandError } from "../CommandErrors";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
  public description = "Export emotes as zip. Supports default emojis or custom emotes";
  public aliases = ["export"];
  public ownerOnly = false;
  public guildOnly = false;
  public userPermissions: PermissionString[] = [];
  public clientPermissions: PermissionString[] = ["ATTACH_FILES"];
  public args = {
    emotes: { type: ArgTypes.EmotesOrEmojis, optional: true, description: "emotes to download (defaults to all server emotes)" }
  } as const;
  public flags = { force: "Skip cache and force redownload" };

  public constructor() {
    void mkdirp(path.join(__dirname, "../../..", ".cache"));
  }

  public async callback(ctx: CommandContext, { emotes, force }: IParsedArgs<Command>): Promise<IMessage> {
    const { cached, zipPath, name } = emotes ? await this.handleEmoteInvoke(ctx, emotes, force) : await this.handleGuildInvoke(ctx, force);

    const content = cached ? "I found this zip in my cache. Run the command with the `--force` flag in case this zip is outdated." : null;
    return ctx.reply(content, { files: [{ attachment: zipPath, name }] });
  }

  public async handleGuildInvoke(ctx: CommandContext, noCache?: boolean) {
    if (!ctx.isGuild()) throw new ArgumentError("Please specify some emotes to download or run this command on a server.");

    if (!ctx.guild.emojis.cache.size) throw new CommandError("This server does not have any emotes.");

    const emotes = ctx.guild.emojis.cache.array();
    return this.downloadEmotes(ctx, `Emotes-${ctx.guild.id}`, emotes, noCache, true);
  }

  public async handleEmoteInvoke(ctx: CommandContext, emotes: IParsedArgs<Command>["emotes"], noCache?: boolean) {
    emotes = removeDuplicates(emotes ?? [], e => (e as ParsedEmote).id ?? e.name);

    if (!emotes.length)
      throw new ArgumentError(
        `Please specify some emotes to download or run this command ${
          ctx.isGuild() ? "without arguments to download all emotes of this server" : "on a server"
        }.`
      );
    return this.downloadEmotes(ctx, `Emotes-${ctx.author.id}`, emotes, noCache);
  }

  public async downloadEmotes(
    ctx: CommandContext,
    zipName: string,
    emojis: Array<ParsedEmote | ParsedEmoji | GuildEmoji>,
    noCache?: boolean,
    guildInvoke = false
  ) {
    const zipPath = path.join(__dirname, "../../..", ".cache", `${zipName}.zip`);

    if (!noCache && (await fileExists(zipPath))) return { cached: true, zipPath };

    const extension = ctx.settings.user?.imageFormat ?? defaultFormat;

    let msg = (await ctx.reply(`${Emotes.DOWNLOADING} Downloading ${emojis.length} emotes...`)) as Message;
    try {
      const buffers = [] as Buffer[];
      for (const emoji of emojis) {
        const url = typeof emoji.url === "string" ? emoji.url : emoji.url();
        let buffer = (await fetch(url)) as Buffer;

        if (url.endsWith("svg")) buffer = await convertImage(buffer, extension, 512, true);

        buffers.push(buffer);
      }
      if (extension !== "png") {
        msg = await msg.edit(`${Emotes.SUCCESS} Downloaded emotes\n${Emotes.LOADING} Converting to \`${extension}\`...`);
        for (const [idx, buf] of buffers.entries()) {
          if ((emojis[idx] as ParsedEmote).animated) continue;
          buffers[idx] = await convertImage(buf, extension);
        }
        msg = await msg.edit(`${Emotes.SUCCESS} Downloaded emotes\n${Emotes.SUCCESS} Converted to \`${extension}\``);
      }

      const { content } = msg;
      await msg.edit(`${content}\n${Emotes.LOADING} Compressing...`);
      const zipFile = new JSZip();

      for (const [idx, buf] of buffers.entries()) {
        const emoji = emojis[idx];
        const ext = (emoji as ParsedEmote).animated ? "gif" : extension;
        const fileName = zipFile.file(`${emoji.name}.${ext}`) ? `${emoji.name}-${(emoji as ParsedEmote).id || Date.now().toString(16)}` : emoji.name;
        zipFile.file(`${fileName}.${ext}`, buf);
      }

      void msg.edit(`${content}\n${Emotes.SUCCESS} Compressed`);
      if (guildInvoke) {
        await zipFile.generateAsync({ type: "uint8array" }).then(blob => writeFile(zipPath, blob, "binary"));
        return { cached: false, zipPath };
      } else {
        return { cached: false, zipPath: await zipFile.generateAsync({ type: "nodebuffer" }), name: zipPath.split(sep).pop() };
      }
    } catch (error) {
      const msg = error?.message || error || "shrug";
      throw new CommandError(`Sorry, something went wrong while downloading emotes: \`${removeTokens(msg)}\``);
    }
  }
}
