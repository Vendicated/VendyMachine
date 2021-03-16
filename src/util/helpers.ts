import nodeFetch, { RequestInfo, RequestInit } from "node-fetch";
import { hastebinMirror, Colours, Emojis } from "./constants";
import { JsonObject, LogCategory } from "./types";
import { MessageEmbed } from "discord.js";
import { CommandContext } from "../commands/CommandContext";
import { codeblock, trim } from "./stringTransform";

/**
 * Helper function to fetch remote content.
 * Will automatically detect content-type and return Image Buffer, Json Object or Plain Text
 * @param {string} url The url to fetch
 * @param {object} [options] Request Options
 * @param {number} [timeout=5] Request timeout, in seconds.
 */
export async function fetch(url: RequestInfo, options?: RequestInit, timeout = 5) {
	return new Promise((resolve, reject) => {
		setTimeout(() => reject(`Request took too long (${timeout}s)`), timeout * 1000);

		nodeFetch(url, options)
			.then(async res => {
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

/**
 * @see fetch
 */
export async function post(url: RequestInfo, options?: RequestInit, timeout = 5) {
	return fetch(
		url,
		{
			...options,
			method: "post"
		},
		timeout
	);
}

/**
 * Helper function to post JSON data
 * Will automatically detect content-type and return Image Buffer, Json Object or Plain Text
 * @param {string} url The url to fetch
 * @param {object} json The JSON data
 * @param {object} [options] Request Options
 * @param {number} [timeout=5] Request timeout, in seconds.
 */
export async function postJson(url: RequestInfo, json: JsonObject, options?: RequestInit, timeout = 5): Promise<JsonObject> {
	return fetch(
		url,
		{
			...options,
			method: "post",
			body: JSON.stringify(json),
			headers: { ...options?.headers, "content-type": "application/json", accept: "application/json" }
		},
		timeout
	) as Promise<JsonObject>;
}

export async function haste(content: string) {
	const { key } = (await post(`${hastebinMirror}/documents`, {
		body: content,
		headers: { "content-type": "text/plain" }
	})) as JsonObject<string>;
	return `${hastebinMirror}/${key}`;
}

/**
 * Prints to console with a nice box
 * @param lines
 */
export function printBox(...lines: string[]) {
	const divider = "-".repeat(lines.reduce((x, y) => (x > y.length ? x : y.length), 0));
	for (const line of [divider, ...lines, divider]) console.log(line);
}

export function errorToEmbed(error: Error, { msg, commandName, rawArgs, guild }: CommandContext) {
	const errorText = trim((error as Error).stack ?? error.name ?? "Unknown error", 2000);

	return new MessageEmbed()
		.setColor(Colours.RED)
		.setTitle("Oops!")
		.setDescription(
			`I'm sorry, an error occurred while executing this command. You can find the details below. Please react with ${Emojis.CHECK_MARK} if it is okay for me to automatically report this to my Owner.`
		)
		.addField("Command", commandName, true)
		.addField("Arguments", rawArgs.join(" "))
		.addField("User", `${msg.author.tag} (${msg.author.id})`)
		.addField("Server", guild ? `${guild.name} (${guild.id})` : "-", true)
		.addField("Message ID", msg.id, true)
		.addField("Error", codeblock((error.name ? `${error.name}:\n` : "") + errorText, "js"));
}

export function postInfo(embeds: MessageEmbed | MessageEmbed[]) {
	return executeWebhook("INFO", null, embeds);
}

export function postError(embeds: MessageEmbed | MessageEmbed[]) {
	return executeWebhook("ERROR", null, embeds);
}

export function executeWebhook(category: LogCategory, content: string | null, embeds?: MessageEmbed[] | MessageEmbed) {
	if (!content && !embeds?.length) throw new Error("Invalid webhook body. Neither content nor embeds are specified.");

	const url = category === "ERROR" ? process.env.ERROR_WEBHOOK : process.env.INFO_WEBHOOK;

	if (embeds && !Array.isArray(embeds)) embeds = [embeds];

	return postJson(url, {
		content,
		embeds: embeds?.map(e => e.toJSON())
	});
}
