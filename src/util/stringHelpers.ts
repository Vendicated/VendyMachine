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

import { MessageOptions, Util } from "discord.js";
import ordinal from "ordinal";
import { inspect } from "util";
import { monthsShort } from "./constants";
import { haste } from "./helpers";

export function codeblock(content: string, language?: string) {
	return `\`\`\`${language ?? ""}\n${Util.cleanCodeBlockContent(content)}\`\`\``;
}

export function trim(text: string, max: number) {
	return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

export function longestLineLength(...lines: string[]): number {
	return lines.reduce((prev, curr) => {
		const individualLines = curr.split("\n");
		const lineLength = individualLines.length > 1 ? longestLineLength(...individualLines) : curr.length;
		return prev > lineLength ? prev : lineLength;
	}, 0);
}

export function toTitleCase(text: string): string;
export function toTitleCase(text: string[]): string[];
export function toTitleCase(text: string | string[]): string[] | string {
	if (Array.isArray(text)) return text.map(word => toTitleCase(word));

	return text
		.split(/_ +/)
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}

export function msToHumanReadable(ms: number, short = false) {
	const seconds = Math.floor((ms / 1000) % 60),
		minutes = Math.floor((ms / (1000 * 60)) % 60),
		hours = Math.floor((ms / (1000 * 60 * 60)) % 24),
		days = Math.floor(ms / (1000 * 60 * 60 * 24));

	if (short) return `${days}d ${hours}h ${minutes}m ${seconds}s`;

	return `${pluralise(days, "day")}, ${pluralise(hours, "hour")}, ${pluralise(minutes, "minute")} and ${pluralise(seconds, "second")}`;
}

export function pluralise(i: number, name: string) {
	return i === 1 ? `${i} ${name}` : `${i} ${name}s`;
}

export function removeTokens(str: string) {
	return str.replaceAll(process.env.TOKEN, "[TOKEN]").replaceAll(process.env.POSTGRES_PASSWORD, "[DB]");
}

export function removePrefix(str: string, prefix: string | string[]) {
	if (Array.isArray(prefix)) {
		let curr;
		while ((curr = prefix.find(p => str.startsWith(p)))) {
			str = str.substr(curr.length);
		}
	} else {
		while (str.startsWith(prefix)) {
			str = str.substr(prefix.length);
		}
	}

	return str;
}

export function removeSuffix(str: string, prefix: string | string[]) {
	if (Array.isArray(prefix)) {
		let curr;
		while ((curr = prefix.find(p => str.endsWith(p)))) {
			str = str.substring(0, str.length - curr.length);
		}
	} else {
		while (str.endsWith(prefix)) {
			str = str.substring(0, str.length - prefix.length);
		}
	}

	return str;
}

/**
 * Converts object to string.
 * If this string is larger than the provided limit, it is uploaded to hastebin, or attached as file if hastebin errors.
 * Otherwise it is wrapped into a codeblock.
 * @param {(object|string)} rawContent The object to format
 * @param {number} limit Upper limit
 * @param {object} messageOptions MessageOptions object to append files to
 * @param {string} altFilename Filename that should be given to this file
 */
export async function formatOutput(rawContent: unknown, limit: number, codeLang: string | null, messageOptions?: MessageOptions, altFilename?: string) {
	if (!rawContent) return "-";

	if (typeof rawContent !== "string") {
		rawContent = inspect(rawContent, { getters: true, compact: false });
	}
	if (codeLang) limit -= 8 + codeLang.length;

	let content = removeTokens(rawContent as string);

	if (content.length > limit) {
		try {
			content = `That was too long for discord, so I uploaded it to hastebin instead\n${await haste(content)}`;
		} catch {
			if (messageOptions && altFilename) {
				const attachment = Buffer.from(content, "utf-8");
				messageOptions.files ||= [];
				messageOptions.files.push({ name: altFilename, attachment });
				content = "That was too long for discord, so I attached the output as file instead.";
			} else {
				content = "That was too long for discord and I was unable to upload it to hastebin. Sorry :(";
			}
		}
	} else if (codeLang) {
		content = codeblock(content, codeLang);
	}

	return content;
}

/**
 * Prints to console with a nice box
 * @param lines
 */
export function printBox(...lines: string[]) {
	const divider = "-".repeat(longestLineLength(...lines));
	for (const line of [divider, ...lines, divider]) console.log(line);
}

/**
 * Prints to console with a nice box
 * @param lines
 */
export function printBoxErr(...lines: string[]) {
	const divider = "-".repeat(longestLineLength(...lines));
	for (const line of [divider, ...lines, divider]) console.error(line);
}

export function formatDate(date: Date) {
	return `${monthsShort[date.getMonth()]} ${ordinal(date.getDate())} ${date.getFullYear()}`;
}
