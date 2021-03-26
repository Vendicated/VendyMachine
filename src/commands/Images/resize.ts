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
import { PermissionString } from "discord.js";
import { bytesToHumanReadable, parseBytes, reduceSize } from "../../util/sharpUtils";
import { Arguments, ArgumentTypes } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { ArgumentError, CommandError } from "../CommandErrors";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
	public description = "Downscale images until they are below a certain size";
	public aliases = ["downscale", "reduce"];
	public ownerOnly = false;
	public guildOnly = false;
	public userPermissions: PermissionString[] = [];
	public clientPermissions: PermissionString[] = ["ATTACH_FILES"];
	public args: Arguments = {
		size: { type: ArgumentTypes.String, default: "256KB", description: "Size to resize to. Format: 100B/10.7KB/2MB" },
		url: { type: ArgumentTypes.Url, description: "Url of file", optional: true },
		startAt512: {
			type: ArgumentTypes.Bool,
			description: "Start at 512px instead of original image width for faster downscaling",
			optional: true,
			default: true
		}
	};

	public async callback(ctx: CommandContext, { size, url, startAt512 }: Args): Promise<unknown> {
		const bytes = parseBytes(size);
		if (!bytes) return ctx.reply(`Invalid size \`${size}\``);

		let name;
		if (!url) {
			const attachment = ctx.msg.attachments.first();
			if (!attachment) throw new ArgumentError("Please attach a file or pass a link");
			({ name, url } = attachment);
		} else {
			name = url.split("/").pop();
		}

		const buffer = (await fetch(url).catch(() => void 0)) as Buffer;
		if (!buffer) throw new CommandError("I was unable to fetch that file, sorry.");

		try {
			const { originalSize, newSize, format, buffer: attachment } = await reduceSize(buffer, bytes, startAt512);

			if (!newSize) {
				return ctx.reply(`File is already smaller than ${bytesToHumanReadable(bytes)} (${bytesToHumanReadable(originalSize)})`);
			}
			name ||= `RESIZED-${Date.now().toString(16)}.${format}`;

			return ctx.reply(`Resized from ${bytesToHumanReadable(originalSize)} to ${bytesToHumanReadable(newSize)}`, { files: [{ attachment, name }] });
		} catch (err) {
			if (err?.message?.startsWith("Input")) throw new CommandError(err.message);
			else throw err;
		}
	}
}

interface Args {
	size: string;
	url?: string;
	startAt512: boolean;
}
