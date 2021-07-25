/** This file is part of VendyMachine, a Discord Bot providing all sorts of emote related commands.
 * Copyright (C) 2021 Vendicated
 *
 * VendyMachine is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * VendyMachine is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with VendyMachine.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Client } from "../Client";
import { InlineEmbed } from "../Embed";
import { logger } from "../Logger";
import { postInfo } from "../util/helpers";

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
  logger.info(embed.title);
  embed.fields.map(field => `${field.name}: ${field.value}`).forEach(logger.info);
}
