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

import { months, monthsShort } from "./constants";

/**
 * Get the month
 * @param {number} num 0-11
 * @param {boolean} short Whether to return 3character format (Jan) instead of the full month
 * @returns {string} month
 */
export function toMonth(num: number, short = true) {
  const month = (short ? monthsShort : months)[num];
  if (!month) throw new RangeError(`Month ${num} is out of bounds. Remember that January should be 0, and December should be 11.`);
  return month;
}

/**
 * Fix the number to a certain amount of digits
 * @param {number} num the number to fix
 * @param {number} digits amount of digits
 * @returns {string} fixed number
 */
export function fix(num: number, digits = 2) {
  const str = num.toString();
  return str.length >= digits ? str : `${"0".repeat(digits - str.length)}${str}`;
}
