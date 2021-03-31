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

import { emoteParser } from "@util/parsers";
import { formatOutput } from "@util/stringHelpers";
import { MessageOptions, PermissionString } from "discord.js";
import { removeDuplicates } from "../../util/arrayUtilts";
import { defaultFormat } from "../../util/constants";
import { emojiParser } from "../../util/parsers";
import { convertSvg } from "../../util/sharpUtils";
import { ParsedEmoji, ParsedEmote } from "../../util/types";
import { ArgTypes, ICommandArgs } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { ArgumentError } from "../CommandErrors";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
	public description = "Get the url of one or more emojis/emotes";
	public aliases = ["emote", "e"];
	public ownerOnly = false;
	public guildOnly = false;
	public userPermissions: PermissionString[] = [];
	public clientPermissions: PermissionString[] = [];
	public args: ICommandArgs = { input: { type: ArgTypes.String, remainder: true, description: "One or more emojis/emotes" } };

	public async callback(ctx: CommandContext, { input }: Args) {
		const emotes: Array<ParsedEmoji | ParsedEmote> = removeDuplicates(
			emoteParser(input).concat((emojiParser(input) as unknown) as ParsedEmote[]),
			e => e.id ?? e.name
		);

		if (!emotes.length) {
			throw new ArgumentError("No emojis provided.");
		} else if (emotes.length === 1) {
			const [e] = emotes;
			const url = e.url();
			// Convert svgs
			if (e.type === "default") {
				const format = ctx.settings.user?.imageFormat ?? defaultFormat;
				const attachment = await convertSvg(url, format);
				await ctx.reply(url, { files: [{ attachment, name: `${e.name}.${format}` }] });
			} else {
				await ctx.reply(url);
			}
		} else {
			const info = emotes.some(e => e.type === "default")
				? "Hint: To automatically convert default emojis to your preferred image format, use this command with one emoji at a time.\n\n"
				: "";
			let urls = emotes.map(e => e.url());
			const characterCount = urls.reduce((acc, curr) => acc + curr.length, 0) + emotes.length * 2 + info.length;
			// If longer than 2000 character we upload to hastebin instead, so do not surround links with <> in that case
			if (characterCount < 2000) urls = urls.map(u => `<${u}>`);

			const options: MessageOptions = {};
			options.content = await formatOutput(info + urls.join("\n"), 2000, null, options, "EmojiUrls.txt");
			await ctx.reply(undefined, options);
		}
	}
}

interface Args {
	input: string;
}
