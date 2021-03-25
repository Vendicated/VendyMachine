import { Random } from "@util/random";
import { PermissionString } from "discord.js";
import { Arguments } from "../CommandArguments";
import { GuildCommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";

export class Command implements IBaseCommand {
	description = "Ping!";
	aliases = ["ms"];
	ownerOnly = false;
	guildOnly = false;
	userPermissions: PermissionString[] = [];
	clientPermissions: PermissionString[] = [];
	args: Arguments = {};

	private responses = [
		"Created emotes",
		"Downloaded emotes",
		"Pinged fbi.gov",
		"Patted catgirls",
		"Ate donuts",
		"Bought muffins",
		"Wrote a discord bot",
		"Did my homework"
	];

	private randomResponse(ping: number) {
		return `${Random.choice(this.responses)} in \`${ping}ms\``;
	}

	async callback(ctx: GuildCommandContext): Promise<void> {
		const msg = await ctx.channel.send("Pinging...");
		const ping = msg.createdTimestamp - (ctx.msg.editedTimestamp || ctx.msg.createdTimestamp);
		await msg.edit(this.randomResponse(ping));
	}
}
