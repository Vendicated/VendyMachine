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
