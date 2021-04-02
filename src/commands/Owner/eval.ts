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

import { Stopwatch } from "@klasa/stopwatch";
import { MessageOptions } from "discord.js";
import { inspect } from "util";
import { Embed } from "../../Embed";
import { logger } from "../../Logger";
import * as constants from "../../util//constants";
import * as regex from "../../util//regex";
import * as stringHelpers from "../../util//stringHelpers";
import { ArgTypes, ICommandArgs } from "../CommandArguments";
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
		const console = {
			_lines: [] as string[],
			_log(...things: string[]) {
				this._lines.push(
					...things
						.map(x => inspect(x, { getters: true }))
						.join(" ")
						.split("\n")
				);
			}
		};
		// @ts-ignore
		console.log = console.error = console.warn = console.info = console._log.bind(console);

		const stopwatch = new Stopwatch();
		const messageOptions: MessageOptions = {};

		let result,
			syncTime,
			asyncTime,
			isPromise,
			success = true;

		try {
			result = eval(script);
			syncTime = stopwatch.toString();

			// Is promise?
			if (result instanceof Promise) {
				const content = (await stringHelpers.formatOutput(result, 1900, "js")) || "-";
				await ctx.reply(`${content}\n${stringHelpers.codeblock(`⏱ ${syncTime}`)}`);

				isPromise = true;
				stopwatch.restart();
				result = await result;
				asyncTime = stopwatch.toString();
			}
		} catch (err) {
			if (!syncTime) syncTime = stopwatch.toString();
			if (isPromise && !asyncTime) asyncTime = stopwatch.toString();
			result = err;

			success = false;
		}

		stopwatch.stop();

		const successStr = success ? "SUCCESS" : "ERROR";
		const timeString = asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
		const consoleOutput = console._lines.join("\n");

		logger.debug(`Evaluated ${script}`);
		logger.debug(`Result: ${result}`);

		if (consoleOutput) {
			logger.debug(`Console Output: ${consoleOutput}`);
			messageOptions.embed = new Embed(successStr)
				.setAuthor("Eval", client.user.displayAvatarURL())
				.addField("Result", (await stringHelpers.formatOutput(result, 1000, "js", messageOptions, "EvalOutput.txt")) || "-")
				.addField("Console", await stringHelpers.formatOutput(consoleOutput, 1000, "js" || "-", messageOptions, "EvalConsole.txt"))
				.setFooter(timeString);
		} else {
			messageOptions.content = `${success ? "" : `${constants.Emotes.ERROR} Oops! That didn't work :(\n`}${
				(await stringHelpers.formatOutput(result, 1900, "js")) || "-"
			}\n${stringHelpers.codeblock(timeString)}`;
		}

		await ctx.edit(messageOptions);
	}
}
