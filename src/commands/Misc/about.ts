import { PACKAGE_JSON } from "@util/constants";
import { msToHumanReadable } from "@util/stringHelpers";
import { stripIndents } from "common-tags";
import { PermissionString, User, version } from "discord.js";
import { InlineEmbed } from "../../Embed";
import { Arguments } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";

export class Command implements IBaseCommand {
	public description = "";
	public aliases = [];
	public ownerOnly = false;
	public guildOnly = false;
	public userPermissions: PermissionString[] = [];
	public clientPermissions: PermissionString[] = [];
	public args: Arguments = {};

	public async callback(ctx: CommandContext): Promise<void> {
		const { client } = ctx;
		const app = await client.fetchApplication();
		const owner = client.owners.size === 1 ? client.owners.first() : app.owner instanceof User ? app.owner : app.owner?.owner.user;

		const url = PACKAGE_JSON.repository.url.replace(".git", "").replace("git+", "");
		const embed = new InlineEmbed("INFO")
			.setTitle(client.user.tag)
			.setURL(url)
			.setThumbnail(client.user.displayAvatarURL())
			.setDescription(
				stripIndents`
                Hello! I am ${client.user.username}, an open source bot centered all around emotes!

                If you have any feedback or questions or would just like to chat, feel free to send my owner a friend request!
            `
			)
			.addField("Owner", owner?.tag)
			.addField("Client ID", client.user.id)
			.addField("Uptime", msToHumanReadable(process.uptime() * 1000, true))
			.addField("Server Count", client.guilds.cache.size)
			.addField("Channel Count", client.channels.cache.size)
			.addField(
				"Estimated User Count",
				client.guilds.cache.reduce((prev, curr) => prev + curr.memberCount, 0)
			)
			.addField("Language", `NodeJS ${process.version}`)
			.addField("Library", `discord.js v${version}`)
			.addField("License", PACKAGE_JSON.license)
			.addField("Source Code", url, false);

		await ctx.reply(undefined, embed);
	}
}
