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

import { MessageEmbed, PermissionString } from "discord.js";
import { InlineEmbed } from "../../Embed";
import { ZWSP } from "../../util//constants";
import { ParsedEmote } from "../../util//types";
import { formatDate } from "../../util/dateUtils";
import { ParsedEmoji } from "../../util/types";
import { ArgTypes, IParsedArgs } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
  public description = "Get Info on an emoji/emote";
  public aliases = ["emoteinfo", "ei"];
  public ownerOnly = false;
  public guildOnly = false;
  public userPermissions: PermissionString[] = [];
  public clientPermissions: PermissionString[] = [];
  public args = { emoji: ArgTypes.EmoteOrEmoji } as const;

  public async callback(ctx: CommandContext, { emoji }: IParsedArgs<Command>) {
    const embed = new InlineEmbed("INFO");

    if (emoji.type === "custom") {
      await this.handleCustomEmote(ctx, emoji, embed);
    } else {
      this.handleDefaultEmoji(emoji, embed);
    }

    await ctx.reply(embed);
  }

  public handleDefaultEmoji(emoji: ParsedEmoji, embed: MessageEmbed) {
    embed.setTitle(`Info for ${emoji.raw}`);
    embed.setURL(emoji.url());
    embed.addField("Name", `\`:${emoji.name}:\``);
    embed.addField("Raw", `\`${emoji.raw}\``);
    embed.addField("Unicode", emoji.unicode());
  }

  public async handleCustomEmote(ctx: CommandContext, emoji: ParsedEmote, embed: MessageEmbed) {
    const clientEmote = ctx.client.emojis.cache.get(emoji.id);
    if (clientEmote) {
      const { name, id, createdAt, url, roles } = clientEmote;
      const author = await clientEmote.fetchAuthor().catch(() => void 0);

      embed.setTitle(`Info for ${clientEmote.toString()}`);
      embed.setURL(url);
      embed.addField("Name", `\`:${name}:\``);
      embed.addField("ID", id);
      embed.addField("Created At", formatDate(createdAt));

      if (author) embed.addField("Author", `${author.tag} (${author.id})`);
      if (roles.cache.size) embed.addField("Roles", roles.cache.map(r => r.name).join(", "));
    } else {
      const { name, id } = emoji;
      embed.setTitle(`Info for :${ZWSP}${name}${ZWSP}:`);
      embed.setURL(emoji.url());
      embed.addField("Name", `\`:${name}:\``);
      embed.addField("ID", id);
      embed.setDescription("I do not have access to this emoji, so I sadly can't provide more info.");
    }
  }
}
