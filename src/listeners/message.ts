import { Emotes } from "@util/constants";
import { stripIndents } from "common-tags";
import { Client } from "../Client";
import { CommandContext } from "../commands/CommandContext";
import { ClientPermissionError, UserPermissionError } from "../commands/CommandErrors";
import { IMessage } from "../IMessage";
import { hasPermission } from "../util/helpers";

export default async function messageListener(client: Client, msg: IMessage) {
	if (msg.author.bot) return;
	// Quit if we do not have sufficient permissions
	if (msg.guild && !hasPermission(["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"], msg.guild.me!, msg.channel)) return;

	const ctx = await CommandContext.fromMessage(msg);
	if (!ctx) {
		if (msg.mentions.has(client.user) && msg.content.replace("!", "") === client.user.toString()) {
			const reply = stripIndents`
					Hello ${msg.author}! I am ${client.user.username}, an open source bot focused all around emotes ${Emotes.CIRNO_WAVE}

					Run \`@${client.user.tag} prefixes\` for a list of available prefixes or \`@${client.user.tag} help\` for a list of commands!

					Invite me: <${client.invite}>
				`;

			await msg.channel.send(reply);
		}

		return;
	}

	const command = client.commands.findCommand(ctx.commandName);

	if (!command || (command.ownerOnly && !client.isOwner(ctx))) return;

	if (ctx.isGuild()) {
		const { clientPermissions, userPermissions } = command;
		if (clientPermissions) {
			if (!hasPermission(clientPermissions, ctx.me, ctx.channel)) {
				throw new ClientPermissionError(clientPermissions);
			}
			if (!hasPermission(userPermissions, ctx.member, ctx.channel)) {
				throw new UserPermissionError(userPermissions);
			}
		}
	} else if (command.guildOnly) {
		return ctx.reply("client command can only be used on a server.");
	}

	await client.commands.execute(command, ctx);
}
