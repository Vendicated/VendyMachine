/**
 * This file is part of Emotely, a Discord Bot providing all sorts of emote related commands.
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

// Use require as otherwise vscode auto sorts imports and puts ../../util/ import over this statement
require("tsconfig-paths/register");
import { execSync } from "child_process";
import fs from "fs";
import table from "markdown-table";
import path from "path";
import { CommandManager } from "../src/commands/CommandManager";
import { ICommand } from "../src/commands/ICommand";
import { toTitleCase } from "../src/util/stringHelpers";

void (async () => {
	const root = path.join(__dirname, "..");
	const assetDir = path.join(root, "assets");

	const commit = execSync("git rev-parse HEAD").toString("utf-8").trim();
	const commitShort = execSync("git rev-parse --short HEAD").toString("utf-8").trim();

	if (!fs.existsSync(assetDir)) {
		console.info("doc dir not found. Automatically creating...");
		fs.mkdirSync(assetDir);
	}

	const manager = new CommandManager();
	await manager.registerAll();

	const categories = manager.reduce((acc, curr) => {
		if (curr.ownerOnly) return acc;
		const category = toTitleCase(curr.category);
		acc[category] ||= [];
		acc[category].push(curr);
		return acc;
	}, {} as Record<string, ICommand[]>);

	let markdown = "# EmoteBot Command List\n\nYou can find a list of all commands below. For more info, simply click on the desired command!\n\n";

	// Create table of contents
	for (const [category, commands] of Object.entries(categories)) {
		markdown += `- [${category}](#${category})\n`;
		for (const { name } of commands) {
			markdown += `\t- [${name}](#${name})\n`;
		}
	}
	markdown += "\n";

	for (const [category, commands] of Object.entries(categories)) {
		markdown += "___\n\n";
		markdown += `## ${category}\n\n`;
		for (const cmd of commands) {
			markdown += `### ${cmd.name}\n\n`;
			markdown += `*${cmd.description || "No Description"}*\n\n`;
			markdown += `- Guild only: ${cmd.guildOnly ? "Yes" : "No"}\n`;
			markdown += `- Required permissions: ${cmd.userPermissions.length ? `\`${toTitleCase(cmd.userPermissions).join("`, `")}\`` : "-"}\n\n`;

			if (Object.keys(cmd.args).length) {
				markdown += "<details>\n\t<summary>Arguments</summary>\n\n";
				markdown += table(
					[
						["Required", "Name", "Type", "Description", "Choices", "Default"],
						...Object.entries(cmd.args).map(([name, arg]) => {
							const arr = [] as string[];
							if (typeof arg !== "string") {
								arr.push(arg.optional ? "❌" : "✅");
								arr.push(name);
								arr.push(arg.type);
								arr.push(arg.description || "-");
								arr.push(arg.choices?.length ? arg.choices.join(", ") : "-");
								arr.push((arg.default as string) || "-");
							} else arr.push("✅", arg, "-", "-", "-");
							return arr;
						})
					],
					{ align: "center" }
				);
				markdown += "\n\n</details>\n\n";
			}
		}
	}

	markdown += "___\n\n";
	markdown += `This markdown file was [auto generated](../scripts/gencmdmd.ts) based on [commit ${commitShort}](https://github.com/Vendicated/EmoteBot/commit/${commit})`;

	fs.writeFileSync(path.join(assetDir, "commands.md"), markdown, "utf8");
	console.info("All done!");
})();
