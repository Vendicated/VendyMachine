#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

void (async () => {
	require("module-alias/register");
	const fs = require("fs");
	const path = require("path");
	const cp = require("child_process");
	const table = require("markdown-table");

	const root = path.join(__dirname, "..");
	const docDir = path.join(root, "docs");
	const distDir = path.join(root, "dist");

	const commit = cp.execSync("git rev-parse HEAD").toString("utf-8");
	const commitShort = cp.execSync("git rev-parse --short HEAD").toString("utf-8");

	if (!fs.existsSync(distDir)) {
		console.info("dist dir not found. Automatically building project...");

		await new Promise(resolve => {
			cp.exec("yarn build", (err, _, stderr) => {
				if (err) console.log(err);
				if (stderr) console.log(stderr);
				if (err || stderr) {
					process.exit(1);
				}
				resolve();
			});
		});
	}

	if (!fs.existsSync(docDir)) {
		console.info("doc dir not found. Automatically creating...");
		fs.mkdirSync(docDir);
	}

	const { toTitleCase } = require(path.join(distDir, "util", "stringHelpers"));
	const { ArgumentFlags } = require(path.join(distDir, "commands", "CommandArguments"));
	const manager = new (require(path.join(distDir, "commands", "CommandManager")).CommandManager)();
	await manager.registerAll();

	const categories = manager.reduce((prev, curr) => {
		if (curr.ownerOnly) return prev;
		const category = toTitleCase(curr.category);
		prev[category] ||= [];
		prev[category].push(curr);
		return prev;
	}, {});

	let markdown = "# EmoteBot Command List\n\nYou can find a list of all commands below. For more info, simply click on the desired command!\n\n";

	// Create table of contents
	for (const [category, commands] of Object.entries(categories)) {
		markdown += `- [${category}](#${category})\n`;
		for (const { name } of commands) {
			markdown += `\t- [${name}](#${name})\n`;
		}
	}

	for (const [category, commands] of Object.entries(categories)) {
		markdown += "\n\n___\n\n";
		markdown += `## ${category}\n\n`;
		for (const cmd of commands) {
			markdown += `#### ${cmd.name}\n\n`;
			markdown += `Guild only: ${cmd.guildOnly ? "Yes" : "No"}\n\n`;
			markdown += `Required permissions: ${cmd.userPermissions.length ? `\`${toTitleCase(cmd.userPermissions).join("`, `")}\`` : "-"}\n\n`;
			markdown += cmd.description;
			if (Object.keys(cmd.args).length) {
				markdown += "\n\n###### Arguments\n\n";
				markdown += table(
					[
						["Required", "Name", "Type", "Explanation", "Choices", "Default"],
						...Object.entries(cmd.args).map(([name, arg]) => {
							const arr = [];
							if (typeof arg !== "string") {
								arr.push(arg.flags && (arg.flags & ArgumentFlags.Optional) !== 0 ? "❌" : "✅");
								arr.push(name);
								arr.push(arg.type);
								arr.push(arg.explanation || "-");
								arr.push(arg.choices?.length ? arg.choices.join(", ") : "-");
								arr.push(arg.default || "-");
							} else arr.push("✅", arg, "-", "-", "-");
							return arr;
						})
					],
					{ align: "center" }
				);
			}
			markdown += "\n\n";
		}
	}

	markdown += "\n\n___\n\n";
	markdown += `This markdown file was [auto generated](../scripts/gencmdmd.js) based on [commit ${commitShort}](https://github.com/Vendicated/EmoteBot/commit/${commit})`;

	fs.writeFileSync(path.join(docDir, "commands.md"), markdown, "utf8");
	console.info("All done!");
})();
