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

import { Guild, GuildMember, Message, MessageOptions, User } from "discord.js";
import { Client } from "../Client";
import { GuildSettings } from "../db/Entities/GuildSettings";
import { UserSettings } from "../db/Entities/UserSettings";
import { IGuildMessage, IMessage } from "../IMessage";

export class CommandContext {
  private _msg: IMessage;
  private readonly _prefix: string;
  public readonly msg: IMessage;
  public readonly guild: Guild | null;
  public readonly member: GuildMember | null;
  /**
   * The client user as member of the current guild
   */
  public readonly me: GuildMember | null;
  public readonly author: User;
  public readonly channel: IMessage["channel"];
  public readonly client: Client;
  public readonly db: Client["db"];
  public readonly settings: { user?: UserSettings; guild?: GuildSettings };
  /**
   * A list of valid prefixes for this context
   */
  public readonly prefixes: Record<"all" | "user" | "guild", string[]>;
  /**
   * The name of the current command
   */
  public readonly commandName: string;
  /**
   * Raw unparsed args
   */
  public readonly rawArgs: string[];

  public constructor(msg: IMessage, prefix: string, commandName: string, args: string[], userSettings?: UserSettings, guildSettings?: GuildSettings) {
    this.msg = msg;
    this.guild = msg.guild;
    this.member = msg.member;
    this.me = msg.guild?.me ?? null;
    this.author = msg.author;
    this.channel = msg.channel;
    this.client = msg.client;
    this.db = msg.client.db;
    this._prefix = prefix;
    this.commandName = commandName;
    this.rawArgs = args;
    this.settings = { user: userSettings, guild: guildSettings };
  }

  /**
   * Create a command context from a message. Returns null if not a command
   * @param msg
   * @returns {CommandContext|null} context
   */
  public static async fromMessage(msg: IMessage) {
    const userSettings = await msg.client.db.getById(UserSettings, msg.author.id);
    const guildSettings = msg.guild ? await msg.client.db.getById(GuildSettings, msg.guild.id) : undefined;

    const prefixes = (userSettings?.prefixes ?? []).concat(guildSettings?.prefixes ?? []);
    if (!prefixes.length) prefixes.push(process.env.DEFAULT_PREFIX);

    const regex = new RegExp(`^(<@!?${msg.client.user.id}>|${prefixes.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\s*`);

    let prefix = regex.exec(msg.content)?.[0];
    if (prefix === undefined) {
      if (msg.guild) return null;
      // Allow no prefix in dms
      else prefix = "";
    }

    const args = msg.content.slice(prefix.length).trim().split(/ +/);

    const commandName = args.shift();
    if (!commandName) return null;

    return new CommandContext(msg, prefix, commandName, args, userSettings, guildSettings);
  }

  /**
   * Whether we are on a guild
   * @returns {boolean}
   */
  public isGuild(): this is GuildCommandContext {
    return Boolean(this.guild);
  }

  /**
   * The prefix this command was invoked with
   */
  public get prefix() {
    return this._prefix.replace(this.client.mentionRegex, `@${this.client.user.tag}`);
  }

  private get filter() {
    return (msg: Message) => msg.author.id === this.msg.author.id;
  }

  /**
   * Helper function to send reply. This will update the old reply if this command was triggered by a message edit
   * @param content
   * @param options
   */
  public async reply(content: any, options?: MessageOptions): Promise<IMessage> {
    this._msg = (await (this.msg.reply(content, options as MessageOptions) as unknown)) as IMessage;
    return this._msg;
  }

  public async edit(content: any, options?: MessageOptions): Promise<IMessage> {
    if (options?.files?.length || content?.files?.length) {
      if (this._msg.deletable) await this._msg.delete().catch(() => void 0);
      return this.reply(content, options);
    }
    if (this._msg && this._msg.editable)
      return this._msg.edit(content, options as MessageOptions).catch(() => this.reply(content, options)) as Promise<IMessage>;

    return this.reply(content, options);
  }

  /**
   * Get additional input from the user
   * @param question The question that will be asked
   * @param time Prompt timeout in seconds
   */
  public async awaitMessage(question: string, time = 30) {
    const msg = await this.msg.reply(question);
    try {
      const input = await this.channel.awaitMessages(this.filter, {
        time: time * 1000,
        max: 1,
        errors: ["time"]
      });

      const choice = input.first();
      if (!choice) throw void 0;

      return choice;
    } catch {
      await this.msg.reply("The prompt has timed out. Please run the command again.");
    } finally {
      if (msg.deletable) void msg.delete().catch(() => void 0);
    }
  }
}

export interface GuildCommandContext extends CommandContext {
  message: IGuildMessage;
  guild: Guild;
  member: GuildMember;
  me: GuildMember;
  channel: IGuildMessage["channel"];
}
