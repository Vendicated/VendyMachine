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

import { fetch } from "@util/helpers";
import { Guild, PermissionString } from "discord.js";
import mkdirp from "mkdirp";
import path from "path";
import { emojiParser, emoteParser } from "../../util/parsers";
import { ParsedEmoji } from "../../util/types";
import { Arguments, ArgumentTypes } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { ArgumentError } from "../CommandErrors";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
	public description = "Export emotes as zip";
	public aliases = ["export"];
	public ownerOnly = false;
	public guildOnly = false;
	public userPermissions: PermissionString[] = [];
	public clientPermissions: PermissionString[] = ["ATTACH_FILES"];
	public args: Arguments = {
		emotes: { type: ArgumentTypes.String, remainder: true, optional: true, description: "One or more emotes to download. Defaults to all server emotes" }
	};

	public async callback(ctx: CommandContext, { emotes }: Args): Promise<void> {
		if (!emotes) {
			await this.handleGuildInvoke(ctx);
		} else {
			await this.handleEmoteInvoke(ctx, emotes);
		}
	}

	public async handleGuildInvoke(ctx: CommandContext) {
		if (!ctx.isGuild()) throw new ArgumentError("Please specify some emotes to download or run this command on a server!");
	}

	public async handleEmoteInvoke(ctx: CommandContext, emotes: string) {
		// TODO
		const emojis = emojiParser(emotes);
		const customEmotes = emoteParser(emotes);
	}

	public async downloadEmojis(guild: Guild, emojis: ParsedEmoji[]) {
		const dir = path.join(__dirname, "../../..", ".cache", guild.id);
		await mkdirp(dir, { mode: 755 });

		for (const emoji of emojis) {
			// TODO
			const outpath = path.join(dir, `${emoji.name}`);
			const buffer = (await fetch(emoji.url())) as Buffer;
		}
	}
}

interface Args {
	emotes?: string;
}
