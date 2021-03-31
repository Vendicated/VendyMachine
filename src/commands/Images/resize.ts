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
import { fetch } from "../../util//helpers";
import { NitroTiers } from "../../util/constants";
import { bytesToHumanReadable, parseBytes, reduceSize } from "../../util/sharpUtils";
import { ArgTypes, ICommandArgs } from "../CommandArguments";
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
	public args: ICommandArgs = {
		size: { type: ArgTypes.String, default: "256KB", description: "Size to resize to. Format: 100B/10.7KB/2MB" },
		url: { type: ArgTypes.Url, description: "Url of image to resize", optional: true }
	};
	public flags: { maxRes: "Start with original image width instead of 512px. Slower" };

	public async callback(ctx: CommandContext, { size, url, maxRes }: Args) {
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
			const { originalSize, newSize, format, buffer: attachment } = await reduceSize(buffer, bytes, !maxRes);

			if (!newSize) {
				return ctx.reply(`File is already smaller than ${bytesToHumanReadable(bytes)} (${bytesToHumanReadable(originalSize)})`);
			} else {
				const nitroLevel = ctx.guild?.premiumTier.toString() ?? "0";
				const limit = NitroTiers[nitroLevel as keyof typeof NitroTiers];
				if (newSize > limit.uploadSizeLimit) return ctx.reply(`That file is too large (${bytesToHumanReadable(newSize)}), sorry :(\n\nTry a smaller size`);
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
	maxRes?: boolean;
}
