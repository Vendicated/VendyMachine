import { Channel, Message, Role, User } from "discord.js";
import validator from "validator";
import { boolParser, channelParser } from "../util/parsers";
import { CommandContext } from "./CommandContext";
import { ICommand } from "./ICommand";

export async function parseArgs(command: ICommand, ctx: CommandContext) {
	const output: CommandArgs = {};

	const args = Object.entries(command.args);

	const requiredArgs = args.filter(arg => !hasFlag(arg[1], ArgumentFlags.Optional)).length;
	if (ctx.rawArgs.length < requiredArgs) throw new ArgumentError(`Too little arguments. Expected ${requiredArgs} but only received ${ctx.rawArgs.length}.`);

	for (let i = 0; i < args.length; ++i) {
		const [key, arg] = args[i];
		const { type, choices, explanation } = arg as Argument;

		let raw: string;

		if (i === args.length - 1 && hasFlag(arg, ArgumentFlags.Remainder)) {
			raw = ctx.rawArgs.slice(i).join(" ");
		} else {
			raw = ctx.rawArgs[i];
		}

		const add = async (parser: (str: string) => Arg | null | Promise<Arg | null>) => {
			try {
				if (raw === null || raw === undefined || raw === "") {
					if (!hasFlag(arg, ArgumentFlags.Optional)) throw new ArgumentError(`Too little args. Please provide a ${type}`);
					else return (arg as Argument).default ?? null;
				}

				let result = await parser(raw);
				if (result === null || result === undefined || (typeof result === "number" && isNaN(result))) throw void 0;

				if (type === ArgumentTypes.String && result === "") throw new ArgumentError(`This command requires text input!`);

				if (choices?.length) {
					if (typeof result === "string") result = result.toLowerCase();

					if (!choices.includes(result)) throw new ArgumentError(`Expected one of \`${choices.join(",")}\`, received \`${result}\``);
				}

				output[key] = result;
			} catch (err: unknown) {
				if (err instanceof ArgumentError) throw err;

				throw new ArgumentError(`Wrong argument \`${raw}\`. Expected ${explanation || type}.`);
			}
		};

		switch (type) {
			case ArgumentTypes.String:
				await add(str => str);
				break;
			case ArgumentTypes.Bool:
				await add(boolParser);
				break;
			case ArgumentTypes.Int:
				await add(validator.toInt);
				break;
			case ArgumentTypes.Float:
				await add(validator.toFloat);
				break;
			case ArgumentTypes.Url:
				await add(str => (validator.isURL(str) ? str : null));
				break;
			case ArgumentTypes.Channel:
				await add((str: string) => channelParser(ctx.client, str));
				break;
			case ArgumentTypes.Message:
				await add((str: string) => channelParser(ctx.client, str));
				break;
			case ArgumentTypes.User:
				await add((str: string) => channelParser(ctx.client, str));
				break;
			case ArgumentTypes.Role:
				await add((str: string) => channelParser(ctx.client, str));
				break;
		}
	}

	return output;
}

export enum ArgumentTypes {
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

export enum ArgumentFlags {
	Remainder = 0b00000001,
	Optional = 0b00000010
}

export interface Argument<T = unknown> {
	default?: T;
	explanation?: string;
	type: ArgumentTypes;
	flags?: number;
	choices?: T[];
}

export type Arguments = Record<string, Argument | Argument["type"]>;

type Arg = string | number | boolean | Channel | Message | User | Role;
export type CommandArgs = Record<string, Arg>;

export class ArgumentError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ArgumentError";
	}
}

function hasFlag(arg: Argument | Argument["type"], flag: ArgumentFlags) {
	if (typeof arg === "string") return false;
	return typeof arg.flags === "number" && Boolean(arg.flags & flag);
}
