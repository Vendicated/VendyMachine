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

import { MessageOptions, PermissionString } from "discord.js";
import { formatOutput } from "../../util//stringHelpers";
import { removeDuplicates } from "../../util/arrayUtilts";
import { defaultFormat } from "../../util/constants";
import { convertSvg } from "../../util/sharpUtils";
import { ParsedEmote } from "../../util/types";
import { ArgTypes, IParsedArgs } from "../CommandArguments";
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
	public args = { emojis: { type: ArgTypes.EmotesOrEmojis } } as const;

	public async callback(ctx: CommandContext, { emojis }: IParsedArgs<Command>) {
		emojis = removeDuplicates(emojis, e => (e as ParsedEmote).id ?? e.name);

		if (!emojis.length) {
			throw new ArgumentError("No emojis provided.");
		} else if (emojis.length === 1) {
			const [e] = emojis;
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
			const info = emojis.some(e => e.type === "default")
				? "Hint: To automatically convert default emojis to your preferred image format, use this command with one emoji at a time.\n\n"
				: "";
			let urls = emojis.map(e => e.url());
			const characterCount = urls.reduce((acc, curr) => acc + curr.length, 0) + emojis.length * 2 + info.length;
			// If longer than 2000 character we upload to hastebin instead, so do not surround links with <> in that case
			if (characterCount < 2000) urls = urls.map(u => `<${u}>`);

			const options: MessageOptions = {};
			options.content = (await formatOutput(info + urls.join("\n"), 2000, null, options, "EmojiUrls.txt")) || "Sorry, something went wrong";
			await ctx.reply(options);
		}
	}
}
