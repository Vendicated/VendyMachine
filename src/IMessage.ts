import { DMChannel, Guild, GuildMember, Message } from "discord.js";
import { Client } from "./Client";

export interface IMessage extends Message {
	client: Client;
}

export interface IGuildMessage extends IMessage {
	guild: Guild;
	member: GuildMember;
	channel: Exclude<IMessage["channel"], DMChannel>;
}
