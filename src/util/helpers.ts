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
import { Channel, GuildChannel, GuildMember, MessageEmbed, PermissionString } from "discord.js";
import nodeFetch, { RequestInfo, RequestInit } from "node-fetch";
import { CommandContext } from "../commands/CommandContext";
import { InlineEmbed } from "../Embed";
import { Emojis, hastebinMirror } from "./constants";
import { codeblock, printBoxErr, removeTokens, trim } from "./stringHelpers";
import { JsonObject, LogCategory } from "./types";

/**
 * Helper function to fetch remote content.
 * Will automatically detect content-type and return Image Buffer, Json Object or Plain Text
 * @param {string} url The url to fetch
 * @param {object} [options] Request Options
 */
export function fetch(url: RequestInfo, options?: RequestInit) {
	return new Promise((resolve, reject) => {
		nodeFetch(url, options)
			.then(res => {
				if (res.status > 299 || res.status < 200) reject(`${res.status.toString() as string}: ${res.statusText as string}`);

				const contentType = res.headers.get("content-type") || "application/json";

				if (contentType.includes("image")) {
					res.buffer().then(resolve).catch(reject);
				} else if (contentType.includes("json")) {
					res.json().then(resolve).catch(reject);
				} else {
					res.text().then(resolve).catch(reject);
				}
			})
			.catch(reject);
	});
}

export function fetchJson(url: RequestInfo, options?: RequestInit) {
	return fetch(url, {
		...options,
		headers: {
			...options?.headers,
			"content-type": "application/json",
			accept: "application/json"
		}
	}) as Promise<JsonObject>;
}

/**
 * @see fetch
 */
export function post(url: RequestInfo, options?: RequestInit) {
	return fetch(url, {
		...options,
		method: "post"
	});
}

/**
 * Helper function to post JSON data
 * Will automatically detect content-type and return Image Buffer, Json Object or Plain Text
 * @param {string} url The url to fetch
 * @param {object} json The JSON data
 * @param {object} [options] Request Options
 */
export function postJson(url: RequestInfo, json: JsonObject, options?: RequestInit): Promise<JsonObject> {
	return fetch(url, {
		...options,
		method: "post",
		body: JSON.stringify(json),
		headers: { ...options?.headers, "content-type": "application/json", accept: "application/json" }
	}) as Promise<JsonObject>;
}

export async function haste(content: string) {
	const { key } = (await post(`${hastebinMirror}/documents`, {
		body: content,
		headers: { "content-type": "text/plain" }
	})) as JsonObject<string>;
	return `${hastebinMirror}/${key}`;
}

export function errorToEmbed(error: unknown, ctx: unknown) {
	const errorString = typeof error === "string" ? error : (error as Error).stack || (error as Error).name || "Unknown error";
	const errorText = trim(removeTokens(errorString), 2000);

	const embed = new InlineEmbed("ERROR")
		.setTitle("Oops!")
		.setDescription(
			`I'm sorry, an error occurred while executing this command. You may find the details below.\n\nPlease react with ${Emojis.CHECK_MARK} if it is okay for me to automatically report this to my Owner.`
		);

	if (ctx instanceof CommandContext) {
		const { commandName, msg, guild, rawArgs } = ctx;
		embed
			.addField("Command", commandName)
			.addField("User", `${msg.author.tag} (${msg.author.id})`)
			.addField("Server", guild ? `${guild.name} (${guild.id})` : "-")
			.addField("Message ID", msg.id)
			.addField("Arguments", rawArgs.join(" ") || "-", false);
	}
	embed.addField("Error", codeblock(removeTokens(errorText), "js"), false);

	return embed;
}

export function postInfo(embeds: MessageEmbed | MessageEmbed[]) {
	if (process.env.NODE_ENV !== "production") return;

	return executeWebhook("INFO", null, embeds);
}

export function postError(embeds: MessageEmbed | MessageEmbed[]) {
	if (process.env.NODE_ENV !== "production") return;

	if (!Array.isArray(embeds)) embeds = [embeds.setDescription("")];
	for (const embed of embeds) {
		printBoxErr(...embed.fields.map(field => `${field.name !== "Error" ? `${field.name}: ` : ""}${field.value.replace(/```[^\n]*/g, "")}`));
	}

	return executeWebhook("ERROR", null, embeds);
}

export function executeWebhook(url: LogCategory, content: string | null, embeds?: MessageEmbed[] | MessageEmbed): Promise<JsonObject<unknown>>;
export function executeWebhook(url: string, content: string | null, embeds?: MessageEmbed[] | MessageEmbed): Promise<JsonObject<unknown>>;
export function executeWebhook(url: string, content: string | null, embeds?: MessageEmbed[] | MessageEmbed) {
	if (!content && !embeds?.length) throw new Error("Invalid webhook body. Neither content nor embeds are specified.");

	if (url === "ERROR") url = process.env.ERROR_WEBHOOK;
	else if (url === "INFO") url = process.env.INFO_WEBHOOK;

	if (embeds && !Array.isArray(embeds)) embeds = [embeds];

	return postJson(url, {
		content,
		embeds: embeds?.map(e => e.toJSON())
	});
}

export function hasPermission(permissions: PermissionString | PermissionString[], member: CommandContext | GuildMember, channel?: Channel) {
	// If DMChannel or not guild return true
	if ((channel && !(channel instanceof GuildChannel)) || (member instanceof CommandContext && !member.isGuild())) return true;

	if (!Array.isArray(permissions)) permissions = [permissions];

	const target = member instanceof GuildMember ? member : member.member;
	// If channel specified use channel permissions else guild permissions
	const perms = channel ? channel.permissionsFor(target) : target.permissions;

	if (!perms) return false;

	return permissions.every(perm => perms.has(perm));
}

export async function timeExecution(code: () => Promise<any>) {
	const stopwatch = new Stopwatch();

	let result,
		syncTime,
		asyncTime,
		isPromise,
		success = true;

	try {
		result = code();
		syncTime = stopwatch.toString();

		// Is promise?
		if (result instanceof Promise || (result && typeof (result as Promise<unknown>).then === "function")) {
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

	return {
		result,
		success,
		syncTime,
		asyncTime,
		timeString: asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`
	};
}
