import { ZWSP } from "@util/constants";
import { emojiParser, emoteParser } from "@util/parsers";
import { formatDate } from "@util/stringHelpers";
import { ParsedEmote } from "@util/types";
import { MessageEmbed, PermissionString } from "discord.js";
import { InlineEmbed } from "../../Embed";
import { ParsedEmoji } from "../../util/types";
import { Arguments, ArgumentTypes } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";

export class Command implements IBaseCommand {
	public description = "Get Info on an emoji/emote";
	public aliases = ["emoteinfo", "ei"];
	public ownerOnly = false;
	public guildOnly = false;
	public userPermissions: PermissionString[] = [];
	public clientPermissions: PermissionString[] = [];
	public args: Arguments = { input: { type: ArgumentTypes.String, remainder: true, description: "An emoji or custom emote" } };

	private isCustom(emoji: ParsedEmoji | ParsedEmote): emoji is ParsedEmote {
		return Object.prototype.hasOwnProperty.call(emoji, "animated");
	}

	public async callback(ctx: CommandContext, { input }: Args): Promise<unknown> {
		const emoji = this.getEmoji(input);

		if (!emoji) return ctx.reply("Please specify an emoji or a custom emote.");
		const embed = new InlineEmbed("INFO");

		if (this.isCustom(emoji)) {
			await this.handleCustomEmote(ctx, emoji, embed);
		} else {
			this.handleDefaultEmoji(emoji, embed);
		}

		await ctx.reply(undefined, embed);
	}

	public getEmoji(str: string) {
		const emotes = emoteParser(str);
		if (emotes.length) return emotes[0];
		return emojiParser(str)[0];
	}

	public handleDefaultEmoji(emoji: ParsedEmoji, embed: MessageEmbed) {
		embed.setTitle(`Info for ${emoji.raw}`);
		embed.setURL(emoji.url());
		embed.addField("Name", `\`:${emoji.name}:\``);
		embed.addField("Raw", `\`${emoji.raw}\``);
		embed.addField("Unicode", emoji.unicode());
	}

	public async handleCustomEmote(ctx: CommandContext, emoji: ParsedEmote, embed: MessageEmbed) {
		const clientEmote = ctx.client.emojis.cache.get(emoji.id);
		if (clientEmote) {
			const { name, id, createdAt, url, roles } = clientEmote;
			const author = await clientEmote.fetchAuthor().catch(() => void 0);

			embed.setTitle(`Info for ${clientEmote.toString()}`);
			embed.setURL(url);
			embed.addField("Name", `\`:${name}:\``);
			embed.addField("ID", id);
			embed.addField("Created At", formatDate(createdAt));

			if (author) embed.addField("Author", `${author.tag} (${author.id})`);
			if (roles.cache.size) embed.addField("Roles", roles.cache.map(r => r.name).join(", "));
		} else {
			const { name, id } = emoji;
			embed.setTitle(`Info for :${ZWSP}${name}${ZWSP}:`);
			embed.setURL(emoji.url());
			embed.addField("Name", `\`:${name}:\``);
			embed.addField("ID", id);
			embed.setDescription("I do not have access to this emoji, so I sadly can't provide more info.");
		}
	}
}

interface Args {
	input: string;
}
