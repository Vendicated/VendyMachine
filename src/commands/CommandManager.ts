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

import { stripIndents } from "common-tags";
import { Collection } from "discord.js";
import fs from "fs/promises";
import path from "path";
import { Embed } from "../Embed";
import { logger } from "../Logger";
import { Emojis, Emotes } from "../util/constants";
import { errorToEmbed, postError } from "../util/helpers";
import { codeblock, toTitleCase } from "../util/stringHelpers";
import { Argument, parseArgs } from "./CommandArguments";
import { CommandContext } from "./CommandContext";
import { ArgumentError, CommandError } from "./CommandErrors";
import { ICommand } from "./ICommand";

export class CommandManager extends Collection<string, ICommand> {
  private async register(filePath: string) {
    logger.debug(`Registering command at ${filePath}...`);
    const commandImport = await import(filePath);

    const command: ICommand = new (commandImport.default ?? commandImport.Command)();

    command.name = path
      .basename(filePath)
      .replace(/\.[jt]s/, "")
      .toLowerCase();
    command.category = path.dirname(filePath).split(path.sep).pop()!.toLowerCase();

    if (command.category === "owner" && !command.ownerOnly) throw new Error(`Owner category command ${command.name} not dev only!`);

    [command.name, ...command.aliases].forEach(name => {
      if (this.findCommand(name)) throw new Error(`Duplicate command name or alias ${name} in file ${filePath}`);
    });

    this.set(command.name, command);

    logger.debug(`Command initialised as ${command.name}`);
    // Delete require cache since import statement transpiles to require statement
    delete require.cache[filePath];
  }

  public async registerAll(directory = __dirname, ignoreFiles = true) {
    for (const filename of await fs.readdir(directory)) {
      const filepath = path.join(directory, filename);
      const stats = await fs.stat(filepath);
      if (stats.isDirectory()) {
        await this.registerAll(filepath, false);
      } else if (!ignoreFiles) {
        await this.register(filepath);
      }
    }
  }

  public async reload() {
    this.clear();
    return this.registerAll();
  }

  public findCommand(name: string) {
    name = name.toLowerCase();
    return this.get(name) || this.find(cmd => cmd.aliases.some(alias => alias === name));
  }

  public search(name: string) {
    name = name.toLowerCase();
    return this.filter(cmd => cmd.name.includes(name) || cmd.aliases.some(alias => alias.includes(name)));
  }

  public formatHelpEmbed(commandName: string, prefix: string, isOwner = false) {
    const command = this.get(commandName.toLowerCase());
    if (!command || (command.ownerOnly && !isOwner)) return null;

    const { name, description, userPermissions, guildOnly } = command;

    const info = stripIndents`
			Guild only: ${guildOnly ? Emojis.CHECK_MARK : Emojis.X}
			Required Permissions: ${userPermissions.length ? `\`${toTitleCase(userPermissions).join("`, `")}\`` : "None"}
		`;
    const argString = Object.entries(this.getArgList(command))
      .map(([key, arg]) => `**${key}:** \`${arg}\``)
      .join("\n");

    const embed = new Embed("INFO")
      .setTitle(name)
      .setDescription(info)
      .addField("Description", description)
      .addField("Usage", codeblock(this.formatUsage(command, prefix)));

    if (argString) embed.addField("Arguments", argString);

    return embed;
  }

  public formatUsage(cmd: ICommand, prefix: string) {
    const args = Object.keys(cmd.args).map(key => {
      const arg = cmd.args[key] as Argument;

      return arg.optional ? `[${key}]` : `<${key}>`;
    });

    return `${prefix}${cmd.name} ${args.join(" ")}`;
  }

  public getArgList(cmd: ICommand) {
    const list = Object.entries(cmd.args).reduce((acc, [key, arg]) => {
      if (typeof arg === "string") {
        acc[key] = arg;
      } else {
        let description = arg.description ?? "";
        if (arg.choices) {
          const text = `One of ${arg.choices.join("|")}`;
          description += description.length ? ` (${text})` : text;
        }
        if (!description.length) description = arg.type;

        acc[key] = description;
      }
      return acc;
    }, {} as Record<string, string>);

    return list;
  }

  public async execute(command: ICommand, ctx: CommandContext) {
    try {
      const args = await parseArgs(command, ctx);
      await command.callback(ctx, args);
    } catch (error) {
      await this.handleCommandError(ctx, error);
    }
  }

  private async handleCommandError(ctx: CommandContext, error: unknown) {
    if (error instanceof ArgumentError) {
      await ctx.reply(error.message);
    } else if (error instanceof CommandError) {
      await ctx.reply(`${Emotes.ERROR} ${error.message}`);
    } else {
      await ctx.reply(errorToEmbed(error, null));
      await postError(errorToEmbed(error, ctx));
    }
  }
}
