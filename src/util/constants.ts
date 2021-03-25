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

export const ZWSP = "​";

export const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
