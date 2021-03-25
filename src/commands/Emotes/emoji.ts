import { emoteParser } from "@util/parsers";
import { formatOutput } from "@util/stringHelpers";
import { MessageOptions, PermissionString } from "discord.js";
import { Arguments, ArgumentTypes } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";

export class Command implements IBaseCommand {
	public description = "Get the url of one or more custom emotes";
	public aliases = ["emote", "e"];
	public ownerOnly = false;
	public guildOnly = false;
	public userPermissions: PermissionString[] = [];
	public clientPermissions: PermissionString[] = [];
	public args: Arguments = { input: { type: ArgumentTypes.String, remainder: true, description: "One or more custom emotes" } };

	public async callback(ctx: CommandContext, { input }: Args) {
		const emotes = emoteParser(input);

		if (!emotes.length) {
			await ctx.reply("No custom emotes provided.");
		} else if (emotes.length === 1) {
			await ctx.reply(emotes[0].url());
		} else {
			let urls = emotes.map(e => e.url());
			const shouldSuppress = urls.reduce((prev, curr) => prev + curr.length, 0) + emotes.length * 2 < 2000;
			if (shouldSuppress) urls = urls.map(u => `<${u}>`);

			const options: MessageOptions = {};
			options.content = await formatOutput(urls.join("\n"), 2000, null, options, "EmojiUrls.txt");
			await ctx.reply(undefined, options);
		}
	}
}

interface Args {
	input: string;
}
