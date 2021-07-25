/** This file is part of VendyMachine, a Discord Bot providing all sorts of emote related commands.
 * Copyright (C) 2021 Vendicated
 *
 * VendyMachine is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * VendyMachine is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with VendyMachine.  If not, see <https://www.gnu.org/licenses/>.
 */

import { MessageOptions, PermissionString } from "discord.js";
import { formatOutput, removePrefix } from "../../util/stringHelpers";
import { ArgTypes, IParsedArgs } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
  public description = "Execute a SQL query. Dangerous";
  public aliases = [];
  public ownerOnly = true;
  public guildOnly = false;
  public userPermissions: PermissionString[] = [];
  public clientPermissions: PermissionString[] = [];
  public args = {
    query: { type: ArgTypes.String, remainder: true }
  } as const;

  public async callback(ctx: CommandContext, { query }: IParsedArgs<Command>) {
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
