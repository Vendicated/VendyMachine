import { codeblock } from "@util/stringHelpers";
import { CommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";
import { CommandError } from '../CommandErrors';

export default class Command implements IBaseCommand {
	public description = "Reload all commands";
	public aliases = [];
	public ownerOnly = true;
	public guildOnly = false;
	public userPermissions = [];
	public clientPermissions = [];
	public args = {};

	public async callback(ctx: CommandContext): Promise<void> {
		await ctx.client.commands
			.reload()
			.then(() => {
				void ctx.reply(`Successfully reloaded all commands! (${ctx.client.commands.size} commands loaded)`);
			})
			.catch(err => {
				throw new CommandError(`Failed to reload commands:\n${(codeblock(err), "js")}`);
			});
	}
}
