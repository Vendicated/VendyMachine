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

import { timeExecution } from "@util/helpers";
import { codeblock, formatOutput, removePrefix } from "@util/stringHelpers";
import { MessageOptions, PermissionString } from "discord.js";
import { Embed } from "../../Embed";
import { ICommandArgs, ArgumentTypes } from "../CommandArguments";
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
		query: { type: ArgumentTypes.String, remainder: true }
	};

	public async callback(ctx: CommandContext, { query }: Args): Promise<void> {
		query = query.trim();

		// Remove codeblocks
		if (query.startsWith("```") && query.endsWith("```")) {
			query = removePrefix(query.substring(3, query.length - 3), ["sql", "postgres", "postgresql"]);
		}

		const func = () => ctx.db.connection.query(query);
		const { result, timeString, success } = await timeExecution(func);

		const messageOptions: MessageOptions = { files: [] };

		messageOptions.embed = new Embed(success ? "SUCCESS" : "ERROR")
			.setAuthor("Query", ctx.client.user.displayAvatarURL())
			.addField("Input", await formatOutput(query, 1000, "sql", messageOptions, "QueryInput.txt"))
			.addField("Result", await formatOutput(result, 1000, "js", messageOptions, "QueryOutput.txt"))
			.addField("Time", codeblock(timeString));

		await ctx.reply(undefined, messageOptions);
	}
}

interface Args {
	query: string;
}
