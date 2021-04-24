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

import { PermissionString } from "discord.js";
import { Embed } from "../../Embed";
import { toTitleCase } from "../../util//stringHelpers";
import { ArgTypes, IParsedArgs } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { CommandError } from "../CommandErrors";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
	public description = "Get help on command usage";
	public aliases = ["h", "command"];
	public ownerOnly = false;
	public guildOnly = false;
	public userPermissions: PermissionString[] = [];
	public clientPermissions: PermissionString[] = [];
	public args = {
		name: {
			type: ArgTypes.String,
			description: "command name / category",
			optional: true
		}
	} as const;

	public async callback(ctx: CommandContext, { name }: IParsedArgs<Command>) {
		const { client, prefix } = ctx;

		const isOwner = client.isOwner(ctx);
		if (!name) return await this.mainMenu(ctx, isOwner);

		const commandEmbed = client.commands.formatHelpEmbed(name, prefix, isOwner);
		if (commandEmbed) return ctx.reply(commandEmbed);

		if (client.commands.some(cmd => cmd.category === name.toLowerCase() && (isOwner ? true : cmd.ownerOnly === false)))
			return await this.categoryHelp(ctx, name);

		throw new CommandError(`Sorry, no command or category with name \`${name}\` found.`);
	}

	public async mainMenu(ctx: CommandContext, isOwner: boolean) {
		const { client, commandName, prefix } = ctx;

		const commandList = client.commands.reduce((acc, curr) => {
			if (curr.ownerOnly && !isOwner) return acc;

			acc[curr.category] ||= [];
			acc[curr.category].push(curr.name);
			return acc;
		}, {} as Record<string, string[]>);

		const fields = Object.entries(commandList).map(([name, value]) => ({ name, value: `\`${value.join("`,`")}\`` }));

		const embed = new Embed("INFO")
			.setTitle("Help")
			.setDescription(`Use \`${prefix}${commandName} command / category\` for more info on a command or category`)
			.addFields(fields);

		await ctx.reply(embed);
	}

	public async categoryHelp(ctx: CommandContext, name: string) {
		const { client, commandName, prefix } = ctx;

		const commandList = client.commands
			.filter(cmd => cmd.category === name.toLowerCase())
			.reduce((acc, curr) => {
				acc[curr.name] = curr.description;
				return acc;
			}, {} as Record<string, string>);

		const description = Object.entries(commandList)
			.map(([name, value]) => `\`${name}\`: ${value}`)
			.join("\n");

		const embed = new Embed("INFO")
			.setTitle(toTitleCase(`${name} Help`))
			.setDescription(`Use \`${prefix}${commandName} command\` for more info on a command\n\n${description}`);

		await ctx.reply(embed);
	}
}
