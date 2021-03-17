import { Util } from "discord.js";

export function codeblock(content: string, language?: string) {
	return `\`\`\`${language ?? ""}\n${Util.cleanCodeBlockContent(content)}\`\`\``;
}

export function trim(text: string, max: number) {
	return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

export function longestLineLength(...lines: string[]): number {
	return lines.reduce((prev, curr) => {
		const individualLines = curr.split("\n");
		const lineLength = individualLines.length > 1 ? longestLineLength(...individualLines) : curr.length;
		return prev > lineLength ? prev : lineLength;
	}, 0);
}

export function toTitleCase(text: string): string;
export function toTitleCase(text: string[]): string[];
export function toTitleCase(text: string | string[]): string[] | string {
	if (Array.isArray(text)) return text.map(word => toTitleCase(word));

	return text
		.split(/_ +/)
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}

export function msToHumanReadable(ms: number, short = false) {
	const seconds = Math.floor((ms / 1000) % 60),
		minutes = Math.floor((ms / (1000 * 60)) % 60),
		hours = Math.floor((ms / (1000 * 60 * 60)) % 24),
		days = Math.floor(ms / (1000 * 60 * 60 * 24));

	if (short) return `${days}d ${hours}h ${minutes}m ${seconds}s`;

	return `${pluralise(days, "day")}, ${pluralise(hours, "hour")}, ${pluralise(minutes, "minute")} and ${pluralise(seconds, "second")}`;
}

export function pluralise(i: number, name: string) {
	return i === 1 ? `${i} ${name}` : `${i} ${name}s`;
}

export function removeTokens(str: string) {
	return str.replaceAll(process.env.TOKEN, "[TOKEN]").replaceAll(process.env.POSTGRES_PASSWORD, "[DB]");
}

export function removePrefix(str: string, prefix: string | string[]) {
	if (Array.isArray(prefix)) {
		let curr;
		while ((curr = prefix.find(p => str.startsWith(p)))) {
			str = str.substr(curr.length);
		}
	} else {
		while (str.startsWith(prefix)) {
			str = str.substr(prefix.length);
		}
	}

	return str;
}

export function removeSuffix(str: string, prefix: string | string[]) {
	if (Array.isArray(prefix)) {
		let curr;
		while ((curr = prefix.find(p => str.endsWith(p)))) {
			str = str.substring(0, str.length - curr.length);
		}
	} else {
		while (str.endsWith(prefix)) {
			str = str.substring(0, str.length - prefix.length);
		}
	}

	return str;
}
