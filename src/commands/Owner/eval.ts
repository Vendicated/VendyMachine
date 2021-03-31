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

import * as constants from "@util/constants";
import * as helpers from "@util/helpers";
import * as regex from "@util/regex";
import * as stringHelpers from "@util/stringHelpers";
import { MessageOptions } from "discord.js";
import { Embed } from "../../Embed";
import { ICommandArgs, ArgTypes } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";

// Unreachable block referencing unused imports as otherwise vscode removes them automatically
// eslint-disable-next-line no-constant-condition
while (false) {
	constants;
	regex;
}

export default class Command implements IBaseCommand {
	public description = "Evaluate js code";
	public args: ICommandArgs = { script: { type: ArgTypes.String, remainder: true } };
	public aliases = [];
	public ownerOnly = true;
	public guildOnly = false;
	public userPermissions = [];
	public clientPermissions = [];

	public async callback(ctx: CommandContext, { script }: { script: string }) {
		// Shortcuts for use in eval command
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { client, channel, msg, rawArgs: args, author, commandName, db, guild, me, member } = ctx;

		script = script.trim();

		// Remove codeblocks
		if (script.startsWith("```") && script.endsWith("```")) {
			script = stringHelpers.removePrefix(script.substring(3, script.length - 3), ["js", "ts"]);
		}

		// Create a dummy console for use in eval command
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const console: any = {
			_lines: [],
			_logger(...things: string[]) {
				this._lines.push(...things.join(" ").split("\n"));
			},
			_formatLines() {
				return this._lines.join("\n");
			}
		};
		console.log = console.error = console.warn = console.info = console._logger.bind(console);

		const func = () => eval(script);

		const { result, timeString, success } = await helpers.timeExecution(func);

		const messageOptions: MessageOptions = { files: [] };

		const consoleOutput = await stringHelpers.formatOutput(console._formatLines(), 1000, "js", messageOptions, "EvalConsoleOutput.txt");

		messageOptions.embed = new Embed(success ? "SUCCESS" : "ERROR")
			.setAuthor("Eval", client.user.displayAvatarURL())
			.addField("Result", await stringHelpers.formatOutput(script, 1000, "js", messageOptions, "EvalInput.txt"))
			.addField("Result", await stringHelpers.formatOutput(result, 1000, "js", messageOptions, "EvalOutput.txt"))
			.setFooter(timeString);

		if (consoleOutput) messageOptions.embed.addField("Console", consoleOutput);

		await ctx.reply(void 0, messageOptions);
	}
}
