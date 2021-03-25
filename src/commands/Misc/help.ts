import { toTitleCase } from "@util/stringHelpers";
import { PermissionString } from "discord.js";
import { Embed } from "../../Embed";
import { Arguments, ArgumentTypes } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";

export class Command implements IBaseCommand {
	public description = "Get help on command usage";
	public aliases = ["h", "command"];
	public ownerOnly = false;
	public guildOnly = false;
	public userPermissions: PermissionString[] = [];
	public clientPermissions: PermissionString[] = [];
	public args: Arguments = { name: { type: ArgumentTypes.String, description: "command / command category", optional: true } };

	public async callback(ctx: CommandContext, { name }: Args): Promise<unknown> {
		const { client, prefix } = ctx;

		const isOwner = client.isOwner(ctx);
		if (!name) return await this.mainMenu(ctx, isOwner);

		const commandEmbed = client.commands.formatHelpEmbed(name, prefix, isOwner);
		if (commandEmbed) return ctx.reply(undefined, commandEmbed);

		if (client.commands.some(cmd => cmd.category === name.toLowerCase() && (isOwner ? true : cmd.ownerOnly === false)))
			return await this.categoryHelp(ctx, name);

		return ctx.reply(`Sorry, no command or category with name ${name} found.`);
	}

	public async mainMenu(ctx: CommandContext, isOwner: boolean) {
		const { client, commandName, prefix } = ctx;

		const commandList = client.commands.reduce((prev, curr) => {
			if (curr.ownerOnly && !isOwner) return prev;

			prev[curr.category] ||= [];
			prev[curr.category].push(curr.name);
			return prev;
		}, {} as Record<string, string[]>);

		const fields = Object.entries(commandList).map(([name, value]) => ({ name, value: `\`${value.join("`,`")}\`` }));

		const embed = new Embed("INFO")
			.setTitle("Help")
			.setDescription(`Use \`${prefix}${commandName} command / category\` for more info on a command or category`)
			.addFields(fields);

		await ctx.reply(undefined, embed);
	}

	public async categoryHelp(ctx: CommandContext, name: string) {
		const { client, commandName, prefix } = ctx;

		const commandList = client.commands
			.filter(cmd => cmd.category === name.toLowerCase())
			.reduce((prev, curr) => {
				prev[curr.name] = curr.description;
				return prev;
			}, {} as Record<string, string>);

		const description = Object.entries(commandList)
			.map(([name, value]) => `\`${name}\`: ${value}`)
			.join("\n");

		const embed = new Embed("INFO")
			.setTitle(toTitleCase(`${name} Help`))
			.setDescription(`Use \`${prefix}${commandName} command\` for more info on a command\n\n${description}`);

		await ctx.reply(undefined, embed);
	}
}

interface Args {
	name: string | null;
}
