import { Bytes } from "./sharpUtils";
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

// @ts-ignore
export * as emojiMap from "../../assets/emojiMap.json";
// @ts-ignore
export * as PACKAGE_JSON from "../../package.json";

export const hastebinMirror = process.env.HASTEBIN_MIRROR || "https://hb.vendicated.dev";
export const ownerFallback = "Vendicated#0001";
export const defaultFormat = "webp";
export const baseInvite = "https://discord.com/api/oauth2/authorize?scope=bot";
export const permissions = "1074121792";

export const Colours = {
  RED: 0xff403c,
  BLUE: 0x0d7dff,
  GREEN: 0x75f1bd
};

export const Emojis = {
  CHECK_MARK: "✅",
  X: "❌",
  INFO: "ℹ️"
};

export const Emotes = {
  CIRNO_WAVE: "<:cirnoWave:824835204672782366>",
  DOWNLOADING: "<a:downloading:825221439288377424>",
  LOADING: "<a:loading:825221441648721940>",
  SUCCESS: "<:check:825221440479559720>",
  ERROR: "<:cross:825221437349953588>"
};

// Zero Width Space
export const ZWSP = "​";

export const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const NitroTiers: Record<"0" | "1" | "2" | "3", Record<"emojiSlots" | "uploadSizeLimit", number>> = {
  "0": {
    emojiSlots: 50,
    uploadSizeLimit: 8 * Bytes.MEGA
  },
  "1": {
    emojiSlots: 100,
    uploadSizeLimit: 8 * Bytes.MEGA
  },
  "2": {
    emojiSlots: 150,
    uploadSizeLimit: 50 * Bytes.MEGA
  },
  "3": {
    emojiSlots: 250,
    uploadSizeLimit: 100 * Bytes.MEGA
  }
};
