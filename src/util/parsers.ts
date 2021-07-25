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

import { Client, Guild, TextChannel } from "discord.js";
import emojiUnicode from "emoji-unicode";
import { emojiMap } from "./constants";
import { emojiRegex, emoteRegex, mentionRegex, roleRegex, snowflakeRegex } from "./regex";
import { ParsedEmoji, ParsedEmote } from "./types";

export function boolParser(str: string) {
  if (["yes", "y", "true", "1", "on", "enable"].includes(str)) return true;
  if (["no", "n", "false", "0", "off", "disable"].includes(str)) return false;
  return null;
}

export async function channelParser(client: Client, str: string) {
  try {
    str = str.replace(/[<#>]/g, "");
    return await client.channels.fetch(str);
  } catch {
    return null;
  }
}

export async function messageParser(channel: TextChannel, str: string) {
  try {
    str = str.replace(new RegExp("https://discord.com/channels/d+/d+/"), "");
    return await channel.messages.fetch(str);
  } catch {
    return null;
  }
}

export async function userParser(client: Client, str: string) {
  try {
    const id = str.match(mentionRegex())?.[1] || str;
    if (snowflakeRegex().test(id)) {
      return await client.users.fetch(id);
    } else {
      // TODO
    }
  } catch {
    return null;
  }
}

export async function roleParser(guild: Guild, str: string) {
  try {
    const id = str.match(roleRegex())?.[1] || str;
    if (snowflakeRegex().test(id)) {
      return await guild.roles.fetch(id);
    } else {
      // TODO
    }
  } catch {
    return null;
  }
}

export function parseEmote(str: string): ParsedEmote | null {
  const [, anim, name, id] = str.match(emoteRegex("")) ?? [];
  if (!id) return null;
  return {
    type: "custom",
    animated: Boolean(anim),
    name,
    id,
    url() {
      return `https://cdn.discordapp.com/emojis/${this.id}.${this.animated ? "gif" : "png"}`;
    }
  };
}

export function parseEmotes(str: string) {
  const regex = emoteRegex();
  const result: ParsedEmote[] = [];
  let match: RegExpExecArray | null = null;

  while ((match = regex.exec(str)) !== null) {
    const emoji: ParsedEmote = {
      type: "custom",
      animated: Boolean(match[1]),
      name: match[2],
      id: match[3],
      url() {
        return `https://cdn.discordapp.com/emojis/${this.id}.${this.animated ? "gif" : "png"}`;
      }
    };
    result.push(emoji);
  }
  return result;
}

export function parseEmoji(str: string): ParsedEmoji | null {
  const [raw] = str.match(emojiRegex("")) ?? [];
  if (!raw) return null;
  const definition = emojiMap[raw as keyof typeof emojiMap] as typeof emojiMap["\uD83D\uDE00"];
  if (!definition) return null;

  return {
    type: "default",
    raw,
    name: definition.b,
    url() {
      return `https://discord.com/assets/${definition.a}.svg`;
    },
    unicode() {
      return `\\u${emojiUnicode(this.raw).toUpperCase()}`;
    }
  };
}

export function parseEmojis(str: string): ParsedEmoji[] {
  const regex = emojiRegex();
  const result: ParsedEmoji[] = [];
  let match: RegExpExecArray | null = null;

  while ((match = regex.exec(str)) !== null) {
    const [raw] = match;
    const definition = emojiMap[raw as keyof typeof emojiMap] as typeof emojiMap["\uD83D\uDE00"];
    if (!definition) continue;

    const { a: assetName, b: name } = definition;
    const emoji: ParsedEmoji = {
      type: "default",
      raw,
      name,
      url() {
        return `https://discord.com/assets/${assetName}.svg`;
      },
      unicode() {
        return `\\u${emojiUnicode(this.raw).toUpperCase()}`;
      }
    };
    result.push(emoji);
  }
  return result;
}

export function parseEmojiOrEmote(str: string) {
  return parseEmote(str) ?? parseEmoji(str);
}

export function parseEmojisOrEmotes(str: string): Array<ParsedEmoji | ParsedEmote> {
  return parseEmotes(str).concat((parseEmojis(str) as unknown) as Array<ParsedEmote>);
}
