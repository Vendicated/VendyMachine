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

import { Channel, GuildEmoji, Message, Role, User } from "discord.js";
import validator from "validator";
import { IMessage } from "../IMessage";
import { boolParser, channelParser } from "../util//parsers";
import { parseEmoji, parseEmojiOrEmote, parseEmojis, parseEmojisOrEmotes, parseEmote, parseEmotes } from "../util/parsers";
import { ParsedEmoji, ParsedEmote } from "../util/types";
import { CommandContext } from "./CommandContext";
import { ArgumentError } from "./CommandErrors";
import { IBaseCommand, ICommand } from "./ICommand";

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
    const { type, choices, description, optional, remainder } = typeof arg === "string" ? ({ type: arg } as Argument) : arg;

    const raw = remainder && i === args.length - 1 ? rawArgs.slice(i).join("") : rawArgs[i];

    const add = async (parser: (str: string) => ICommandInvokeArg | null | Promise<ICommandInvokeArg | null>) => {
      try {
        if (raw === null || raw === undefined || raw === "") {
          if (!optional) throw new ArgumentError(`Too little args. Please provide a ${type}`);
          else return (arg as Argument).default ?? null;
        }

        let result = await parser(raw);
        if (result === null || result === undefined || (typeof result === "number" && isNaN(result))) throw void 0;

        if (type === ArgTypes.String && result === "") throw new ArgumentError(`This command requires text input!`);
        if (Array.isArray(result) && !result.length) throw void 0;

        if (choices?.length) {
          if (typeof result === "string") result = result.toLowerCase();

          if (!choices.includes(result)) throw new ArgumentError(`Expected one of \`${choices.join(",")}\`, received \`${result}\``);
        }

        output[key] = result;
      } catch (err: unknown) {
        if (err instanceof ArgumentError) throw err;

        throw new ArgumentError(`Wrong argument \`${raw}\`. Expected ${remainder ? "one or more arguments of type " : ""}${description || type}.`);
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
      case ArgTypes.GuildEmoji: {
        if (!ctx.isGuild()) throw new Error(`Expected Guild emoji argument but received DM`);
        await add((str: string) => {
          const parsed = parseEmote(str);
          return (parsed && ctx.guild.emojis.cache.get(parsed.id)) ?? null;
        });
        break;
      }
      case ArgTypes.GuildEmojis: {
        if (!ctx.isGuild()) throw new Error(`Expected Guild emojis argument but received DM`);
        await add(
          (str: string) =>
            parseEmotes(str)
              .map(e => ctx.guild.emojis.cache.get(e.id))
              .filter(Boolean) as GuildEmoji[]
        );
        break;
      }
      case ArgTypes.Emote:
        await add((str: string) => parseEmote(str));
        break;
      case ArgTypes.Emotes:
        await add((str: string) => parseEmotes(str));
        break;
      case ArgTypes.Emoji:
        await add((str: string) => parseEmoji(str));
        break;
      case ArgTypes.Emojis:
        await add((str: string) => parseEmojis(str));
        break;
      case ArgTypes.EmoteOrEmoji:
        await add((str: string) => parseEmojiOrEmote(str));
        break;
      case ArgTypes.EmotesOrEmojis:
        await add((str: string) => parseEmojisOrEmotes(str));
    }
  }

  return output;
}

export interface Argument<T = unknown> {
  default?: T;
  description?: string;
  type: ArgTypes;
  optional?: boolean;
  remainder?: boolean;
  choices?: readonly T[];
}

export type ICommandArgs = Record<string, Argument | Argument["type"]>;

type ICommandInvokeArg =
  | string
  | number
  | boolean
  | Channel
  | Message
  | User
  | Role
  | GuildEmoji
  | ParsedEmoji
  | ParsedEmote
  | GuildEmoji[]
  | ParsedEmoji[]
  | ParsedEmote[]
  | Array<ParsedEmoji | ParsedEmote>;

export type ICommandInvokeArgs = Record<string, ICommandInvokeArg>;

export enum ArgTypes {
  String = "text",
  Bool = "boolean",
  Int = "number",
  Float = "float",
  Channel = "channel",
  Message = "message",
  User = "user",
  Role = "role",
  Url = "url",
  GuildEmoji = "server emote",
  GuildEmojis = "server emotes",
  Emote = "custom emote",
  Emotes = "custom emotes",
  Emoji = "default emoji",
  Emojis = "default emojis",
  EmoteOrEmoji = "custom emote or default emoji",
  EmotesOrEmojis = "custom emotes or default emojis"
}
interface ArgLookup {
  text: string;
  boolean: boolean;
  number: number;
  float: number;
  channel: Channel;
  message: IMessage;
  user: User;
  role: Role;
  url: string;
  "server emote": GuildEmoji;
  "server emotes": GuildEmoji[];
  "custom emote": ParsedEmote;
  "custom emotes": ParsedEmote[];
  "default emoji": ParsedEmoji;
  "default emojis": ParsedEmoji[];
  "custom emote or default emoji": ParsedEmoji | ParsedEmote;
  "custom emotes or default emojis": Array<ParsedEmoji | ParsedEmote>;
  _empty: undefined;
  _never: never;
}

type IPossiblyOptionalArg<Arg extends Argument, T = ArgLookup[Arg["type"]]> = Arg["optional"] extends true ? T | undefined : T;

// This hurts my brain but I somehow made it work
type IParsedArg<Arg> = Arg extends Argument
  ? Arg["choices"] extends ReadonlyArray<infer T>
    ? IPossiblyOptionalArg<Arg, T>
    : IPossiblyOptionalArg<Arg>
  : /* --------------------------------- */
  Arg extends ArgTypes
  ? ArgLookup[Arg]
  : never;

/* Converts Command args object to interface with strongly typed parsed arguments */
export type IParsedArgs<Command extends IBaseCommand, Args = Command["args"], Flags = Command["flags"]> = {
  -readonly [prop in keyof Args]: IParsedArg<Args[prop]>;
} &
  {
    [prop in keyof Flags]: boolean;
  };
