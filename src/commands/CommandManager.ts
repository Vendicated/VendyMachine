import { Collection } from "discord.js";
import fs from "fs/promises";
import path from "path";
import { ICommand } from "./ICommand";
import { ArgumentFlags } from "./CommandArguments";

export class CommandManager {
	private readonly commands = new Collection<string, ICommand>();

	private async register(filePath: string) {
		const commandImport = await import(filePath);

		const command: ICommand = new commandImport.Command();

		command.name = path.basename(filePath).replace(".js", "");
		command.category = path.dirname(filePath);

		[command.name, ...command.aliases].forEach(name => {
			if (this.get(name)) throw new Error(`Duplicate command name or alias ${name} in file ${filePath}`);
		});

		this.set(command.name, command);

		// Delete require cache since import statement transpiles to require statement
		delete require.cache[filePath];
	}

	public async registerAll(directory = __dirname, ignoreFiles = true) {
		for await (const filename of await fs.readdir(directory)) {
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
		this.commands.clear();
		return this.registerAll();
	}

	public get(name: string) {
		name = name.toLowerCase();
		return this.commands.get(name) || this.commands.find(cmd => cmd.aliases.includes(name));
	}

	public search(name: string) {
		name = name.toLowerCase();
		return this.commands.filter(cmd => cmd.name.includes(name) || cmd.aliases.some(alias => alias.includes(name)));
	}

	public delete(name: string) {
		return this.commands.delete(name);
	}

	public set(name: string, command: ICommand) {
		return this.commands.set(name, command);
	}

	public has(name: string) {
		return this.commands.has(name);
	}

	public get size() {
		return this.commands.size;
	}

	public formatUsage(cmd: ICommand) {
		const args = cmd.args.map(arg => {
			const explanation = arg.explanation || arg.type;
			return arg.flags && arg.flags & ArgumentFlags.Optional ? `[${explanation}]` : `<${explanation}>`;
		});

		return `${cmd.name} ${args.join(" ")}`;
	}
}
