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

import { Guild } from "discord.js";
import { NitroTiers } from "./constants";

export function getFreeEmojiSlots(guild: Guild) {
  const { emojiSlots } = NitroTiers[(guild.premiumTier.toString() || "0") as keyof typeof NitroTiers];

  const [animated, regular] = guild.emojis.cache.partition(e => e.animated).map(x => x.size);
  return {
    animated: emojiSlots - animated,
    regular: emojiSlots - regular
  };
}
