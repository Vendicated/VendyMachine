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
import { ArgTypes, IParsedArgs } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { CommandError } from "../CommandErrors";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
	public description = "Rename an emote";
	public aliases = [];
	public ownerOnly = false;
	public guildOnly = true;
	public userPermissions: PermissionString[] = ["MANAGE_EMOJIS"];
	public clientPermissions: PermissionString[] = ["MANAGE_EMOJIS"];
	public args = {
		emoji: ArgTypes.GuildEmoji,
		name: { type: ArgTypes.String, description: "The new name" }
	} as const;

	public async callback(ctx: CommandContext, { emoji, name }: IParsedArgs<Command>) {
		if (emoji.name === name) throw new CommandError(`That emote is already called ${name}.`);

		const emote = await emoji.edit({ name }, `Renamed by ${ctx.author.tag}`).catch(() => void 0);

		if (!emote) throw new CommandError(`I'm sorry, something went wrong while renaming ${emoji}`);
		await ctx.reply(`Done! ${emote}`);
	}
}
