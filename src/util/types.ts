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

export type JsonObject<T = unknown> = Record<string, T>;

export type LogCategory = "INFO" | "ERROR";

export interface ParsedEmote {
  type: "custom";
  animated: boolean;
  name: string;
  id: string;
  url(): string;
}

export interface ParsedEmoji {
  type: "default";
  raw: string;
  name: string;
  url(): string;
  unicode(): string;
}

export type ImageFormat = "png" | "jpeg" | "webp";
