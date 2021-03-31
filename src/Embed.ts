/** This file is part of Emotely, a Discord Bot providing all sorts of emote related commands.
 * Copyright (C) 2021 Vendicated
 *
 * Emotely is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Emotely is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Emotely.  If not, see <https://www.gnu.org/licenses/>.
 */
import { MessageEmbed } from "discord.js";
import { Colours } from "./util//constants";

export class Embed extends MessageEmbed {
	public constructor(level: "SUCCESS" | "ERROR" | "INFO") {
		super();
		this.setLevel(level);
	}

	public setLevel(level: "SUCCESS" | "ERROR" | "INFO") {
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
