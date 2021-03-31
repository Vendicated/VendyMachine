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

import { bytesToHumanReadable, convertImage, getMetadata } from "@util/sharpUtils";
import { PermissionString } from "discord.js";
import { defaultFormat, NitroTiers } from "../../util/constants";
import { fetch } from "../../util/helpers";
import { removeTokens } from "../../util/stringHelpers";
import { ImageFormat } from "../../util/types";
import { ArgTypes, ICommandArgs } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { ArgumentError, CommandError } from "../CommandErrors";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
	public description = "Convert images between formats. Supports svg, png, jpeg, webp and a bunch more, just try it out lol";
	public aliases = [];
	public ownerOnly = false;
	public guildOnly = false;
	public userPermissions: PermissionString[] = [];
	public clientPermissions: PermissionString[] = ["ATTACH_FILES"];
	public args: ICommandArgs = {
		outputFormat: {
			type: ArgTypes.String,
			optional: true,
			choices: ["png", "jpeg", "webp"],
			description: "The image format to convert to. Defaults to the one specified in your settings"
		},
		url: {
			type: ArgTypes.Url,
			optional: true,
			description: "Url of image to convert"
		},
		width: {
			type: ArgTypes.Int,
			optional: true,
			description: "Width that image should be scaled to. (Height is automatically calculated)"
		}
	};

	public async callback(ctx: CommandContext, { outputFormat, url, width }: Args) {
		// TODO Change to ??= once typescript properly supports this
		if (!outputFormat) outputFormat = ctx.settings.user?.imageFormat ?? defaultFormat;

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
			const attachment = await convertImage(buffer, outputFormat, width, url.endsWith("svg"));

			name ||= `CONVERTED-${Date.now().toString(16)}.${outputFormat}`;
			if (!name.endsWith(`.${outputFormat}`)) {
				const extIndex = name.lastIndexOf(".");
				name = extIndex === -1 ? `${name}.${outputFormat}` : `${name.slice(0, extIndex)}.${outputFormat}`;
			}

			const { size } = await getMetadata(attachment);
			if (size) {
				const nitroLevel = ctx.guild?.premiumTier.toString() ?? "0";
				const limit = NitroTiers[nitroLevel as keyof typeof NitroTiers];
				if (size > limit.uploadSizeLimit)
					return ctx.reply(`That file is too large (${bytesToHumanReadable(size)}), sorry :(\n\nTry a different format or use the resize command`);
			}

			await ctx.reply(undefined, { files: [{ attachment, name }] });
		} catch (err) {
			const msg = `Something went wrong while processing your image: \`${err?.message ?? err ?? "shrug"}\``;
			// Just to make sure
			await ctx.reply(removeTokens(msg));
		}
	}
}

interface Args {
	outputFormat?: ImageFormat;
	url?: string;
	width?: number;
}
