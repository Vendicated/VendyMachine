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
import { ICommandArgs, ArgumentTypes } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { ArgumentError } from "../CommandErrors";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
	public description = "Get the url of one or more custom emotes";
	public aliases = ["emote", "e"];
	public ownerOnly = false;
	public guildOnly = false;
	public userPermissions: PermissionString[] = [];
	public clientPermissions: PermissionString[] = [];
	public args: ICommandArgs = { input: { type: ArgumentTypes.String, remainder: true, description: "One or more custom emotes" } };

	public async callback(ctx: CommandContext, { input }: Args) {
		const emotes = emoteParser(input);

		if (!emotes.length) {
			throw new ArgumentError("No custom emotes provided.");
		} else if (emotes.length === 1) {
			await ctx.reply(emotes[0].url());
		} else {
			let urls = emotes.map(e => e.url());
			const shouldSuppress = urls.reduce((acc, curr) => acc + curr.length, 0) + emotes.length * 2 < 2000;
			if (shouldSuppress) urls = urls.map(u => `<${u}>`);

			const options: MessageOptions = {};
			options.content = await formatOutput(urls.join("\n"), 2000, null, options, "EmojiUrls.txt");
			await ctx.reply(undefined, options);
		}
	}
}

interface Args {
	input: string;
}
