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
import { toTitleCase } from "../util/stringHelpers";

export class CommandError extends Error {
  public name = "CommandError";
}

export class ArgumentError extends CommandError {
  public name = "ArgumentError";
}

export class ClientPermissionError extends CommandError {
  public constructor(permissions: PermissionString[]) {
    super();
    this.name = "ClientPermissionError";
    this.message = `Sorry, I can't do that. Needed permissions: \`${toTitleCase(permissions).join("`, `")}\``;
  }
}

export class UserPermissionError extends CommandError {
  public constructor(permissions: PermissionString[]) {
    super();
    this.name = "UserPermissionError";
    this.message = `You are not allowed to do this. Required permissions: \`${toTitleCase(permissions).join("`, `")}\``;
  }
}
