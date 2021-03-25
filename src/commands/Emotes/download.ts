import { fetch } from "@util/helpers";
import { Guild, PermissionString } from "discord.js";
import mkdirp from "mkdirp";
import path from "path";
import { emojiParser, emoteParser } from "../../util/parsers";
import { ParsedEmoji } from "../../util/types";
import { Arguments, ArgumentTypes } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";

export class Command implements IBaseCommand {
	public description = "Export emotes as zip";
	public aliases = ["export"];
	public ownerOnly = false;
	public guildOnly = false;
	public userPermissions: PermissionString[] = [];
	public clientPermissions: PermissionString[] = ["ATTACH_FILES"];
	public args: Arguments = {
		emotes: { type: ArgumentTypes.String, remainder: true, optional: true, description: "One or more emotes to download. Defaults to all server emotes" }
	};

	public async callback(ctx: CommandContext, { emotes }: Args): Promise<void> {
		if (!emotes) {
			await this.handleGuildInvoke(ctx);
		} else {
			await this.handleEmoteInvoke(ctx, emotes);
		}
	}

	public async handleGuildInvoke(ctx: CommandContext) {
		if (!ctx.isGuild()) return ctx.reply("Please specify some emotes to download or run this command on a server!");
	}

	public async handleEmoteInvoke(ctx: CommandContext, emotes: string) {
		const emojis = emojiParser(emotes);
		const customEmotes = emoteParser(emotes);
	}

	public async downloadEmojis(guild: Guild, emojis: ParsedEmoji[]) {
		const dir = path.join(__dirname, "../../..", ".cache", guild.id);
		await mkdirp(dir, { mode: 755 });

		for (const emoji of emojis) {
			const outpath = path.join(dir, `${emoji.name}`);
			const buffer = (await fetch(emoji.url())) as Buffer;
		}
	}
}

interface Args {
	emotes?: string;
}
