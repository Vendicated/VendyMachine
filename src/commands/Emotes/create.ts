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
import { fetch } from "../../util/helpers";
import { convertSvg } from "../../util/sharpUtils";
import { ArgTypes, ICommandArgs } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { ArgumentError } from "../CommandErrors";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
	public description = "Create an emote";
	public aliases = ["new", "add"];
	public ownerOnly = false;
	public guildOnly = true;
	public userPermissions: PermissionString[] = ["MANAGE_EMOJIS"];
	public clientPermissions: PermissionString[] = ["MANAGE_EMOJIS"];
	public args: ICommandArgs = {
		name: { type: ArgTypes.String, description: "Name to give this emote" },
		url: { type: ArgTypes.Url, description: "Image url", optional: true }
	};

	public async callback(ctx: CommandContext, { name, url }: Args) {
		if (!url) {
			url = ctx.msg.attachments.first()?.url;
			if (!url) throw new ArgumentError("Please specify an image url or attach a file");
		}

		const isAnimated = url.endsWith(".gif");
		const buf = url.endsWith(".svg") ? await convertSvg(url, "webp") : ((await fetch(url)) as Buffer);

		// TODO Finish logic and add error handling
	}
}

interface Args {
	name: string;
	url?: string;
}
