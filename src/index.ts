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

import { Intents } from "discord.js";
import { Client } from "./Client";
import { logger } from "./Logger";
import { errorToEmbed, postError } from "./util/helpers";

const client = new Client({
	// Enable channel partials to get DM events
	partials: ["CHANNEL"],
	// No Mentions!!!!!
	allowedMentions: { repliedUser: false, parse: [] },
	// Do not cache messages, no need
	messageCacheMaxSize: 0,
	intents: Intents.NON_PRIVILEGED
});

void client.registerCommands().registerHandlers().connect();

process.on("uncaughtException", err => {
	const embed = errorToEmbed(err, null);
	void postError(embed);
});

process.on("unhandledRejection", rej => {
	const embed = errorToEmbed(rej, null);
	void postError(embed);
});

client.on("debug", msg => logger.debug(msg));

process.on("warning", warning => logger.warn(warning));
