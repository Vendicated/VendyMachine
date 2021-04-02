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

import { stripIndents } from "common-tags";
import type { PartialDMChannel } from "discord.js";
import { Client } from "../Client";
import { CommandContext } from "../commands/CommandContext";
import { ClientPermissionError, UserPermissionError } from "../commands/CommandErrors";
import { IMessage } from "../IMessage";
import { logger } from "../Logger";
import { Emotes } from "../util//constants";
import { hasPermission } from "../util/helpers";

export default async function messageListener(client: Client, msg: IMessage) {
	if (msg.author.bot) return;

	if (((msg.channel as unknown) as PartialDMChannel).partial) await msg.channel.fetch();

	// Quit if we do not have sufficient permissions
	if (msg.guild && !hasPermission(["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"], msg.guild.me!, msg.channel)) return;

	const ctx = await CommandContext.fromMessage(msg);
	if (!ctx) {
		if (msg.mentions.has(client.user) && msg.content.replace("!", "") === client.user.toString()) {
			const reply = stripIndents`
					Hello ${msg.author}! I am ${client.user.username}, an open source bot focused all around emotes ${Emotes.CIRNO_WAVE}

					Run \`@${client.user.tag} prefixes\` for a list of available prefixes or \`@${client.user.tag} help\` for a list of commands!

					Invite me: <${client.invite}>
				`;

			await msg.channel.send(reply);
		}

		return;
	}

	const command = client.commands.findCommand(ctx.commandName);

	if (!command || (command.ownerOnly && !client.isOwner(ctx))) return;

	logger.debug(`Received command ${command.name} by ${ctx.author.tag}`);
	if (ctx.isGuild()) {
		const { clientPermissions, userPermissions } = command;
		if (clientPermissions) {
			if (!hasPermission(clientPermissions, ctx.me, ctx.channel)) {
				return ctx.channel.send(new ClientPermissionError(clientPermissions).message);
			}
			if (!hasPermission(userPermissions, ctx.member, ctx.channel)) {
				return ctx.channel.send(new UserPermissionError(userPermissions).message);
			}
		}
	} else if (command.guildOnly) {
		return ctx.reply("client command can only be used on a server.");
	}

	await client.commands.execute(command, ctx);
}
