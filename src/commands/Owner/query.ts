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

import { MessageOptions, PermissionString } from "discord.js";
import { formatOutput, removePrefix } from "../../util/stringHelpers";
import { ArgTypes, ICommandArgs } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
	public description = "Execute a SQL query. Dangerous";
	public aliases = [];
	public ownerOnly = true;
	public guildOnly = false;
	public userPermissions: PermissionString[] = [];
	public clientPermissions: PermissionString[] = [];
	public args: ICommandArgs = {
		query: { type: ArgTypes.String, remainder: true }
	};

	public async callback(ctx: CommandContext, { query }: Args) {
		query = query.trim();

		// Remove codeblocks
		if (query.startsWith("```") && query.endsWith("```")) {
			query = removePrefix(query.substring(3, query.length - 3), ["sql", "postgres", "postgresql"]);
		}

		const messageOptions: MessageOptions = { files: [] };
		try {
			const result = await ctx.db.connection.query(query);
			messageOptions.content = (await formatOutput(result, 2000, "js", messageOptions, "QueryResult.txt")) || "-";
		} catch (err) {
			messageOptions.content = (await formatOutput(err, 2000, "js", messageOptions, "QueryError.txt")) || "-";
		}

		await ctx.reply(messageOptions);
	}
}

interface Args {
	query: string;
}
