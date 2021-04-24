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
/* eslint-disable @typescript-eslint/no-var-requires */

import { writeFileSync } from "fs";
import fetch from "node-fetch";
import path from "path";

void (async () => {
  const { version, emojiDefinitions } = await fetch("https://static.emzi0767.com/misc/discordEmojiMap.json", {
    headers: { accept: "application/json", "content-type": "application/json" }
  })
    .then(res => res.text())
    .then(text => JSON.parse(text.trim()));

  const out: Record<string, Record<string, string>> = { version };

  for (const emoji of emojiDefinitions) {
    const e: Record<string, string> = (out[emoji.surrogates] = {});

    // Use short names and remove .svg extension to save space
    e.a = emoji.assetFileName.replace(".svg", "");
    e.b = emoji.primaryName;
  }

  writeFileSync(path.join(__dirname, "..", "assets", "emojiMap.json"), JSON.stringify(out));
})();
