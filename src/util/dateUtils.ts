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

import ordinal from "ordinal";
import { fix, toMonth } from "./numberUtils";
import { pluralise } from "./stringHelpers";

/**
 * formats day
 * @param date the date to format
 * @returns {string} MMM D. YYYY
 */
export function formatDate(date: Date) {
  return `${toMonth(date.getMonth())} ${ordinal(date.getDate())} ${date.getFullYear()}`;
}

/**
 * formats time
 * @param date the date to format
 * @returns {string} hh:mm:ss
 */
export function formatTime(date: Date) {
  return `${fix(date.getHours(), 2)}:${fix(date.getMinutes(), 2)}:${fix(date.getSeconds(), 2)}`;
}

/**
 * formats dates in human readable way
 * @param date the date to format
 * @returns {string} MMM D. YYYY at hh:mm:ss
 */
export function formatDateHumanReadable(date: Date) {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

/**
 * Formats date compactly
 * @param date the date to format
 * @returns {string} DD.MM.YYYY hh:mm:ss
 */
export function formatDateCompact(date: Date) {
  return `${fix(date.getDate(), 2)}.${fix(date.getMonth() + 1, 2)}.${date.getFullYear()} ${formatTime(date)}`;
}

export function msToHumanReadable(ms: number, short = false) {
  const seconds = Math.floor((ms / 1000) % 60),
    minutes = Math.floor((ms / (1000 * 60)) % 60),
    hours = Math.floor((ms / (1000 * 60 * 60)) % 24),
    days = Math.floor(ms / (1000 * 60 * 60 * 24));

  if (short) return `${days}d ${hours}h ${minutes}m ${seconds}s`;

  return `${pluralise(days, "day")}, ${pluralise(hours, "hour")}, ${pluralise(minutes, "minute")} and ${pluralise(seconds, "second")}`;
}
