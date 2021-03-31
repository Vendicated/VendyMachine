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

import { Emotes } from "@util/constants";
import { removeSuffix } from "@util/stringHelpers";
import AbortController from "abort-controller";
import { PermissionString } from "discord.js";
import fetch from "node-fetch";
import { ArgTypes, ICommandArgs } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
	public description = "Follow a link's redirects to find out where it leads";
	public aliases = ["trace", "wheregoes", "follow", "redirects", "301"];
	public ownerOnly = false;
	public guildOnly = false;
	public userPermissions: PermissionString[] = [];
	public clientPermissions: PermissionString[] = [];
	public args: ICommandArgs = {
		url: { type: ArgTypes.Url, description: "The url to trace" }
	};

	public async callback(ctx: CommandContext, { url }: Args) {
		if (!url.includes("://")) url = `http://${url}`;
		const content = `${Emotes.LOADING} Tracing ${this.formatUrl(url)}...\n\n>>> `;
		let traceResult = "";
		await ctx.reply(`${content}...`);

		let location = url;
		let redirected = false;
		let redirects = 0;
		const controller = new AbortController();
		do {
			// Abort after 5 seconds
			const timeout = setTimeout(() => controller.abort(), 5000);
			try {
				// Try head first
				let res = await fetch(location, { method: "HEAD", redirect: "manual", signal: controller.signal });
				// Method not allowed
				if (res.status === 405) res = await fetch(location, { method: "GET", redirect: "manual", signal: controller.signal });

				traceResult += `${redirected ? "\n\n==>" : ""}${this.formatUrl(location)} => ${res.status} ${res.statusText}`;
				location = res.headers.raw().location?.[0];
				redirected = Boolean(location);
			} catch (err) {
				const reason = err?.name === "AbortError" ? "Took too long (+5s)" : "Failed to fetch";
				traceResult += `${this.formatUrl(location)} => ${reason}`;
				redirected = false;
			} finally {
				clearTimeout(timeout);
				if (redirected) {
					redirects++;
					await ctx.edit(content + traceResult);
				}
			}
		} while (redirected);

		await ctx.edit(`${redirects || "No"} redirects found for ${this.formatUrl(url)}\n\n>>> ${traceResult}`);
	}

	private formatUrl(url: string) {
		return `<${removeSuffix(url, "/")}>`;
	}
}

interface Args {
	url: string;
}
