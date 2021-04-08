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

import { PermissionString } from "discord.js";
import { partition } from "../../util/arrayUtilts";
import { Emotes } from "../../util/constants";
import { getFreeEmojiSlots } from "../../util/discordUtils";
import { convertSvg } from "../../util/sharpUtils";
import { ParsedEmoji, ParsedEmote } from "../../util/types";
import { ArgTypes, ICommandArgs } from "../CommandArguments";
import { GuildCommandContext } from "../CommandContext";
import { ArgumentError } from "../CommandErrors";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
	public description = "Clone one or more emojis/emotes to the current server";
	public aliases = [];
	public ownerOnly = false;
	public guildOnly = true;
	public userPermissions: PermissionString[] = ["MANAGE_EMOJIS"];
	public clientPermissions: PermissionString[] = ["MANAGE_EMOJIS"];
	public args: ICommandArgs = {
		emojis: { type: ArgTypes.EmoteOrEmoji, remainder: true }
	};

	public async callback(ctx: GuildCommandContext, { emojis }: Args) {
		if (!emojis.length) throw new ArgumentError("Please specify some emotes to clone");

		const slots = getFreeEmojiSlots(ctx.guild);
		const [animToAdd, toAdd] = partition(emojis, e => e.type === "custom" && e.animated).map(x => x.length);

		if (animToAdd > slots.animated)
			throw new ArgumentError(
				`Too many animated emotes! This server ${
					slots.animated > 0 ? `only has ${slots.animated} free slots but you tried cloning ${animToAdd}` : "has no free slots"
				}.`
			);
		if (toAdd > slots.regular)
			throw new ArgumentError(
				`Too many regular emotes! This server ${
					slots.regular > 0 ? `only has ${slots.regular} free slots but you tried cloning ${toAdd}` : "has no free slots"
				}.`
			);

		const regStr = toAdd ? `${toAdd} regular emotes` : "";
		const animStr = animToAdd ? `${animToAdd} animated emotes` : "";
		const joinStr = regStr && animStr ? " and " : "";
		const counts = `${regStr}${joinStr}${animStr}`;
		const msg = await ctx.reply(`${Emotes.LOADING} Cloning ${counts}...`);

		const result = await this.uploadEmotes(ctx, emojis);
		let output: string;
		if (result.length === emojis.length) {
			output = `${Emotes.SUCCESS} Done! Successfully cloned ${counts}:\n${result.join(" ")}`;
		} else {
			output = `${
				result.length
					? `${Emotes.ERROR} Sorry, I was only able to clone ${result.length}/${emojis.length} emotes:\n${result.join(" ")}`
					: `${Emotes.ERROR} Sorry, something went wrong.`
			}\n\nThis is most likely related to rate limit, which usually lasts for an hour. Please try again later.`;
		}

		await msg.edit(output).catch(() => void 0);
	}

	public async uploadEmotes(ctx: GuildCommandContext, emotes: Array<ParsedEmoji | ParsedEmote>) {
		const passed = [] as string[];
		for (const emote of emotes) {
			const buf = emote.type === "default" ? await convertSvg(emote.url(), "webp") : emote.url();

			const result = await new Promise(resolve => {
				// Time out after 5 seconds as we may get rate limited
				const timeout = setTimeout(() => resolve(false), 5000);

				ctx.guild.emojis
					.create(buf, emote.name)
					.then(e => {
						clearTimeout(timeout);
						passed.push(e.toString());
						resolve(true);
					})
					.catch(() => resolve(false));
			});
			if (!result) break;
		}

		return passed;
	}
}

interface Args {
	emojis: Array<ParsedEmoji | ParsedEmote>;
}
