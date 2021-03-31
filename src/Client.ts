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
import { Client as BaseClient, ClientApplication, ClientEvents as BaseClientEvents, ClientUser, Collection, GuildMember, Team, User } from "discord.js";
import fs from "fs/promises";
import path from "path";
import { CommandContext } from "./commands/CommandContext";
import { CommandManager } from "./commands/CommandManager";
import { Database } from "./db";
import { IMessage } from "./IMessage";
import { baseInvite, permissions } from "./util/constants";
import { mentionRegex } from "./util/regex";

interface ClientEvents extends BaseClientEvents {
	message: [IMessage];
	messageUpdate: [IMessage, IMessage];
}

export class Client extends BaseClient {
	// Type user as not null for convenience
	public user!: ClientUser;
	public application!: ClientApplication;
	// Add typing for own Events
	public readonly on!: <Event extends keyof ClientEvents>(event: Event, listener: (...args: ClientEvents[Event]) => void) => this;
	public readonly emit!: <Event extends keyof ClientEvents>(event: Event, ...args: ClientEvents[Event]) => boolean;

	public db = new Database();
	public commands = new CommandManager();
	public owners = new Collection<string, User>();

	public get invite() {
		return `${baseInvite}&client_id=${this.user.id}&permissions=${permissions}`;
	}

	public get mentionRegex() {
		return mentionRegex(this.user.id);
	}

	private async _registerHandlers() {
		const listenerDir = path.join(__dirname, "events");
		for (const name of await fs.readdir(listenerDir)) {
			const listenerPath = path.join(listenerDir, name);
			const listener = await import(listenerPath);
			this.on(name.replace(/\.[jt]s/, "") as keyof ClientEvents, (listener.default ?? listener.listener).bind(null, this));

			delete require.cache[listenerPath];
		}
	}

	public registerHandlers() {
		void this._registerHandlers();
		return this;
	}

	public registerCommands() {
		void this.commands.registerAll();
		return this;
	}

	private async initDb() {
		await this.db.init();
	}

	public isOwner(ctx: User | GuildMember | CommandContext) {
		if (ctx instanceof User || ctx instanceof GuildMember) return this.owners.has(ctx.id);
		return this.owners.has(ctx.author.id);
	}

	private async addOwner(owner: Team | User) {
		if (owner instanceof Team) owner.members.forEach(member => this.addOwner(member.user));
		else this.owners.set(owner.id, owner);
	}

	public async fetchOwners() {
		if (!this.application) throw new Error("Client is not ready");

		let { owner } = this.application.partial ? await this.application.fetch() : this.application;
		owner ||= await this.users.fetch(process.env.OWNER_ID!).catch(() => null);
		if (!owner) throw new Error("I was not able to get data about my owners from Discord. Please set an enviroment variable OWNER_ID");
		await this.addOwner(owner);
	}

	public async connect() {
		await this.initDb()
			.then(() => this.login(process.env.TOKEN))
			.then(() => this.fetchOwners());
		return this;
	}
}
