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

import { Channel, Message, Role, User } from "discord.js";
import validator from "validator";
import { boolParser, channelParser } from "../util//parsers";
import { CommandContext } from "./CommandContext";
import { ArgumentError } from "./CommandErrors";
import { ICommand } from "./ICommand";

export async function parseArgs(command: ICommand, ctx: CommandContext) {
	const output: ICommandInvokeArgs = {};

	const args = Object.entries(command.args);

	let rawArgs = [] as string[];

	if (command.flags) {
		for (const arg of ctx.rawArgs) {
			if (arg.startsWith("--")) {
				let flag = arg.slice(2).toLowerCase();
				let dividerIndex: number;
				// Remove - and convert following character to uppercase, so --no-cache becomes noCache
				while ((dividerIndex = flag.indexOf("-")) !== -1) {
					flag = flag.slice(0, dividerIndex) + flag.charAt(dividerIndex + 1).toUpperCase() + flag.slice(dividerIndex + 2);
				}

				if (Object.hasOwnProperty.call(command.flags, flag)) output[flag] = true;
				else rawArgs.push(arg);
			} else rawArgs.push(arg);
		}
	} else ({ rawArgs } = ctx);

	const requiredArgs = args.filter(([, arg]) => typeof arg === "string" || !arg.optional).length;

	if (rawArgs.length < requiredArgs) throw new ArgumentError(`Too little arguments. Expected ${requiredArgs} but only received ${rawArgs.length}.`);

	for (let i = 0; i < args.length; ++i) {
		const [key, arg] = args[i];
		const { type, choices, description, optional, remainder } = arg as Argument;

		let raw: string;

		if (i === args.length - 1 && remainder) {
			raw = rawArgs.slice(i).join(" ");
		} else {
			raw = rawArgs[i];
		}

		const add = async (parser: (str: string) => ICommandInvokeArg | null | Promise<ICommandInvokeArg | null>) => {
			try {
				if (raw === null || raw === undefined || raw === "") {
					if (!optional) throw new ArgumentError(`Too little args. Please provide a ${type}`);
					else return (arg as Argument).default ?? null;
				}

				let result = await parser(raw);
				if (result === null || result === undefined || (typeof result === "number" && isNaN(result))) throw void 0;

				if (type === ArgTypes.String && result === "") throw new ArgumentError(`This command requires text input!`);

				if (choices?.length) {
					if (typeof result === "string") result = result.toLowerCase();

					if (!choices.includes(result)) throw new ArgumentError(`Expected one of \`${choices.join(",")}\`, received \`${result}\``);
				}

				output[key] = result;
			} catch (err: unknown) {
				if (err instanceof ArgumentError) throw err;

				throw new ArgumentError(`Wrong argument \`${raw}\`. Expected ${description || type}.`);
			}
		};

		switch (type) {
			case ArgTypes.String:
				await add(str => str);
				break;
			case ArgTypes.Bool:
				await add(boolParser);
				break;
			case ArgTypes.Int:
				await add(validator.toInt);
				break;
			case ArgTypes.Float:
				await add(validator.toFloat);
				break;
			case ArgTypes.Url:
				await add(str => (validator.isURL(str) ? str : null));
				break;
			case ArgTypes.Channel:
				await add((str: string) => channelParser(ctx.client, str));
				break;
			case ArgTypes.Message:
				await add((str: string) => channelParser(ctx.client, str));
				break;
			case ArgTypes.User:
				await add((str: string) => channelParser(ctx.client, str));
				break;
			case ArgTypes.Role:
				await add((str: string) => channelParser(ctx.client, str));
				break;
		}
	}

	return output;
}

export enum ArgTypes {
	String = "text",
	Bool = "boolean",
	Int = "number",
	Float = "floating point number",
	Channel = "channel",
	Message = "message",
	User = "user",
	Role = "role",
	Url = "url"
}

export interface Argument<T = unknown> {
	default?: T;
	description?: string;
	type: ArgTypes;
	optional?: boolean;
	remainder?: boolean;
	choices?: T[];
}

export type ICommandArgs = Record<string, Argument | Argument["type"]>;

type ICommandInvokeArg = string | number | boolean | Channel | Message | User | Role;
export type ICommandInvokeArgs = Record<string, ICommandInvokeArg>;
