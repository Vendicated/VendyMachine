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

import { PermissionString } from "discord.js";
import { Arguments } from "./CommandArguments";
import { CommandContext } from "./CommandContext";

export interface IBaseCommand {
	description: string;
	aliases: string[];
	ownerOnly: boolean;
	guildOnly: boolean;
	userPermissions: PermissionString[];
	clientPermissions: PermissionString[];
	args: Arguments;
	callback(ctx: CommandContext, args: Record<string, any>): Promise<unknown>;
}

export interface ICommand extends IBaseCommand {
	name: string;
	category: string;
}
