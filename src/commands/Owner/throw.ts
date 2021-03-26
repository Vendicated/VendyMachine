import { Arguments, ArgumentTypes } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
	public description = "Test command error handling";
	public aliases = [];
	public ownerOnly = true;
	public guildOnly = false;
	public userPermissions = [];
	public clientPermissions = [];
	public args: Arguments = { error: { type: ArgumentTypes.String, optional: true, remainder: true } };

	public async callback(ctx: CommandContext, { error }: { error: string }): Promise<void> {
		throw new Error(error ?? "Method not implemented");
	}
}
