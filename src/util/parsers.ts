import { Client, Guild, TextChannel } from "discord.js";
import { mentionRegex, roleRegex, snowflakeRegex } from "./regex";

export function boolParser(str: string) {
	if (["yes", "y", "true", "1", "on", "enable"].includes(str)) return true;
	if (["no", "n", "false", "0", "off", "disable"].includes(str)) return false;
	return null;
}

export async function channelParser(client: Client, str: string) {
	try {
		str = str.replace(/[<#>]/g, "");
		return await client.channels.fetch(str);
	} catch {
		return null;
	}
}

export async function messageParser(channel: TextChannel, str: string) {
	try {
		str = str.replace(new RegExp("https://discord.com/channels/d+/d+/"), "");
		return await channel.messages.fetch(str);
	} catch {
		return null;
	}
}

export async function userParser(client: Client, str: string) {
	try {
		const id = str.match(mentionRegex())?.[1] || str;
		if (snowflakeRegex().test(id)) {
			return await client.users.fetch(id);
		} else {
			// TODO
		}
	} catch {
		return null;
	}
}

export async function roleParser(guild: Guild, str: string) {
	try {
		const id = str.match(roleRegex())?.[1] || str;
		if (snowflakeRegex().test(id)) {
			return await guild.roles.fetch(id);
		} else {
			// TODO
		}
	} catch {
		return null;
	}
}
