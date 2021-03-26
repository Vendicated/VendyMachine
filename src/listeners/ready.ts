import { Client } from "../Client";
import { InlineEmbed } from "../Embed";
import { postInfo } from "../util/helpers";
import { printBox } from "../util/stringHelpers";

export default function listener({ user, guilds, channels, commands }: Client) {
	void user.setActivity({ type: "LISTENING", name: `@${user.tag}` });

	const embed = new InlineEmbed("SUCCESS")
		.setTitle("Successfully connected to discord")
		.addField("Mode", process.env.NODE_ENV)
		.addField("User", `${user.tag} (${user.id})`)
		.addField("Guilds", guilds.cache.size)
		.addField("Channels", channels.cache.size)
		.addField(
			"Estimated Users",
			guilds.cache.reduce((x, y) => x + y.memberCount, 0)
		)
		.addField("Commands loaded", commands.size);

	void postInfo(embed);
	printBox(embed.title!, ...embed.fields.map(field => `${field.name}: ${field.value}`));
}
