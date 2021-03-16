import { codeblock } from "../../util/stringHelpers";
import { CommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";

export class Command implements IBaseCommand {
	description = "Reload all commands";
	aliases = [];
	ownerOnly = true;
	guildOnly = false;
	userPermissions = [];
	clientPermissions = [];
	args = [];

	async callback(ctx: CommandContext): Promise<void> {
		await ctx.client.commands
			.reload()
			.then(() => {
				void ctx.reply(`Successfully reloaded all commands! (${ctx.client.commands.size} commands loaded)`);
			})
			.catch(err => {
				void ctx.reply(`Failed to reload commands:\n${(codeblock(err), "js")}`);
			});
	}
}
