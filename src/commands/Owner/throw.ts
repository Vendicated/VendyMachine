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

import { ArgTypes, IParsedArgs } from "../CommandArguments";
import { CommandContext } from "../CommandContext";
import { IBaseCommand } from "../ICommand";

export default class Command implements IBaseCommand {
	public description = "Test command error handling";
	public aliases = [];
	public ownerOnly = true;
	public guildOnly = false;
	public userPermissions = [];
	public clientPermissions = [];
	public args = {
		error: {
			type: ArgTypes.String,
			optional: true,
			remainder: true
		}
	} as const;

	public async callback(ctx: CommandContext, { error }: IParsedArgs<Command>) {
		throw new Error(error ?? "Method not implemented");
	}
}
