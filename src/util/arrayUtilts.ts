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

/**
 * Removes duplicate elements from array. Uses a hashmap for best efficiency, so only string[] are supported
 * unless a mapper function that takes items from the array as argument and returns a string is passed as second argument
 * @param {Array} arr The array to remove duplicates from
 * @param {Function} mapper The function to call on every item to get its UNIQUE string representation
 * @returns {Array} Array without duplicates
 */
export function removeDuplicates<T>(arr: T[], mapper: (val: T) => string): T[];
export function removeDuplicates(arr: string[]): string[];
export function removeDuplicates(arr: any[], mapper?: (val: any) => string) {
	const seen: Record<string, true> = {};
	return arr.filter(item => {
		const key: string = mapper ? mapper(item) : item;
		return Object.prototype.hasOwnProperty.call(seen, key) ? false : (seen[key] = true);
	});
}
