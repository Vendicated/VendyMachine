import { PermissionString } from "discord.js";
import { Arguments } from "./CommandArguments";
import { CommandContext } from "./CommandContext";

export interface IBaseCommand {
	description: string;
	aliases: string[];
	ownerOnly: boolean;
	guildOnly: boolean;
	userPermissions: PermissionString[];
	clientPermissions: PermissionString[];
	args: Arguments;
	callback(ctx: CommandContext, args: Record<string, any>): Promise<void>;
}

export interface ICommand extends IBaseCommand {
	name: string;
	category: string;
}
