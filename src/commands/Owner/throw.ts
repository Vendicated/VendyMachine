import { Arguments, ArgumentTypes } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";

export class Command implements IBaseCommand {
	description = "Test command error handling";
	aliases = [];
	ownerOnly = true;
	guildOnly = false;
	userPermissions = [];
	clientPermissions = [];
	args: Arguments = { error: { type: ArgumentTypes.String, optional: true, remainder: true } };

	async callback(ctx: CommandContext, { error }: { error: string }): Promise<void> {
		throw new Error(error ?? "Method not implemented");
	}
}
