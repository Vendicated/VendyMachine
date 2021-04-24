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

export class Random {
  public static choice<T>(arr: T[]): T | undefined {
    if (!arr.length) return;
    else if (arr.length === 1) return arr[0];

    return arr[this.next(arr.length - 1)];
  }

  public static chooseMultiple<T>(amount: number, arr: T[]): T[] | undefined {
    if (arr.length < amount) return;

    return this.nextN(amount, arr.length - 1).map(x => arr[x]);
  }

  public static next(min: number, max: number): number;
  public static next(max: number): number;
  public static next(min: number, max?: number) {
    // Allow omitting min
    if (max === undefined) {
      max = min;
      min = 0;
    } else if (min > max) throw SyntaxError("Minimum may not be lower than maximum.");

    return min + Math.floor(Math.random() * (max - min + 1));
  }

  public static nextN(n: number, min: number, max: number): number[];
  public static nextN(n: number, max: number): number[];
  public static nextN(n: number, min: number, max?: number) {
    if (max === undefined) {
      max = min;
      min = 0;
    } else if (min > max) throw SyntaxError("Minimum may not be lower than maximum.");
    else if (max - min < n) throw new RangeError("Difference between min and max lower than n");

    const outputs = [] as number[];

    do {
      const next = this.next(min, max);
      if (!outputs.includes(next)) outputs.push(next);
    } while (outputs.length !== n);

    return outputs;
  }

  public static shuffle<T>(arr: T[]): T[] {
    // Make copy of array
    const array = arr.slice();

    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  }
}
