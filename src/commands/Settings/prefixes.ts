import { Emojis } from "@util/constants";
import { PermissionString, Util } from "discord.js";
import { Embed } from "../../Embed";
import { Arguments } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
	public description = "Get a list of available prefixes";
	public aliases = ["prefix", "p"];
	public ownerOnly = false;
	public guildOnly = false;
	public userPermissions: PermissionString[] = [];
	public clientPermissions: PermissionString[] = [];
	public args: Arguments = {};

	public async callback(ctx: CommandContext): Promise<void> {
		if (ctx.rawArgs.length === 3) {
			// Let's redirect them to setprefix :)
			const { client } = ctx;
			const command = client.commands.get("setprefix");

			if (command) return await client.commands.execute(command, ctx);
		}

		const { guild, user } = await ctx.db.getPrefixes(ctx.msg);

		const embed = new Embed("INFO")
			.setTitle("Prefixes")
			.setDescription(`You can change or add new prefixes with \`${ctx.prefix}setprefix\``)
			.setFooter(`${Emojis.INFO} Hint: In case you ever forget my prefix, just mention me!`);

		if (guild.length) {
			embed.addField("Server", this.formatPrefixes(guild), true);
		}
		if (user.length) {
			embed.addField("Own", this.formatPrefixes(user), true);
		}

		if (!embed.fields.length) embed.addField("Default", `\`${process.env.DEFAULT_PREFIX}\``);

		await ctx.reply(undefined, embed);
	}

	public formatPrefixes(prefixes: string[]) {
		return `\`${prefixes.map(prefix => Util.escapeInlineCode(prefix)).join("`\n`")}\``;
	}
}
