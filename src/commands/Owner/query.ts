import { timeExecution } from "@util/helpers";
import { codeblock, formatOutput, removePrefix } from "@util/stringHelpers";
import { MessageOptions, PermissionString } from "discord.js";
import { Embed } from "../../Embed";
import { Arguments, ArgumentTypes } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";

export class Command implements IBaseCommand {
	public description = "Execute a SQL query. Dangerous";
	public aliases = [];
	public ownerOnly = true;
	public guildOnly = false;
	public userPermissions: PermissionString[] = [];
	public clientPermissions: PermissionString[] = [];
	public args: Arguments = {
		query: { type: ArgumentTypes.String, remainder: true }
	};

	public async callback(ctx: CommandContext, { query }: Args): Promise<void> {
		query = query.trim();

		// Remove codeblocks
		if (query.startsWith("```") && query.endsWith("```")) {
			query = removePrefix(query.substring(3, query.length - 3), ["sql", "postgres", "postgresql"]);
		}

		const func = () => ctx.db.connection.query(query);
		const { result, timeString, success } = await timeExecution(func);

		const messageOptions: MessageOptions = { disableMentions: "all", files: [] };

		messageOptions.embed = new Embed(success ? "SUCCESS" : "ERROR")
			.setAuthor("Query", ctx.client.user.displayAvatarURL())
			.addField("Input", await formatOutput(query, 1000, "sql", messageOptions, "QueryInput.txt"))
			.addField("Result", await formatOutput(result, 1000, "js", messageOptions, "QueryOutput.txt"))
			.addField("Time", codeblock(timeString));

		await ctx.reply(undefined, messageOptions);
	}
}

interface Args {
	query: string;
}
