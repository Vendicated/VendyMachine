import { MessageEmbed } from "discord.js";
import { Colours } from "./util/constants";

export class Embed extends MessageEmbed {
	public constructor(level: "SUCCESS" | "ERROR" | "INFO") {
		super();
		this.setLevel(level);
	}

	setLevel(level: "SUCCESS" | "ERROR" | "INFO") {
		const color = level === "SUCCESS" ? Colours.GREEN : level === "ERROR" ? Colours.RED : Colours.BLUE;
		this.setColor(color);
	}
}

/**
 * Embed intended for inline fields. inline value in fields defaults to true
 */
export class InlineEmbed extends Embed {
	public addField(name: any, value: any, inline = true) {
		return super.addField(name, value, inline);
	}
}
