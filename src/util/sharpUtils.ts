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

import sharp from "sharp";
import { fetch } from "./helpers";
import { bytesRegex } from "./regex";
import { ImageFormat } from "./types";

export enum Bytes {
	KILO = 1000,
	MEGA = 1000 * 1000
}

export function bytesToHumanReadable(bytes: number) {
	if (bytes > Bytes.MEGA) return `${(bytes / Bytes.MEGA).toFixed(2)}MB`;
	if (bytes > Bytes.KILO) return `${(bytes / Bytes.KILO).toFixed(2)}KB`;
	return `${bytes}B`;
}

export function parseBytes(input: string) {
	const match = input.match(bytesRegex());
	if (!match) return null;
	const [, amount, multiplier] = match;
	switch (multiplier.toLowerCase()) {
		case "kb":
			return Math.floor(parseFloat(amount) * Bytes.KILO);
		case "mb":
			return Math.floor(parseFloat(amount) * Bytes.MEGA);
		case "b":
			return parseInt(amount);
		default:
			throw new Error(`Invalid size ${multiplier}`);
	}
}

export async function reduceSize(input: Buffer, targetSize: number, startAt512 = true) {
	let buf = sharp(input);

	// eslint-disable-next-line prefer-const
	let { size, format, height, width } = await buf.metadata();
	if (size === undefined) throw new Error("Input is not a buffer");
	else if (!format || !width || !height) throw new Error("Input is not an image");

	const originalSize = size;
	if (size < targetSize) return { originalSize, newSize: null, buffer: input, format };

	let buffer: Buffer;
	// Try resizing to 512 first, else gradually decrease until smaller
	let newWidth = startAt512 ? Math.min(512, width * 0.95) : width * 0.95;
	do {
		buffer = await buf.resize(Math.floor(newWidth)).toBuffer();
		buf = sharp(buffer);
		({ size, width } = await buf.metadata());
		newWidth *= 0.95;
	} while (size! > targetSize);

	return { originalSize, newSize: size!, buffer, format };
}

export async function convertImage(input: Buffer, format: ImageFormat, width?: number, isSvg?: boolean) {
	const options = isSvg ? { density: 1000 } : undefined;
	const buf = sharp(input, options)[format]();
	return width ? buf.resize(width).toBuffer() : buf.toBuffer();
}

export async function getMetadata(input: Buffer) {
	return sharp(input).metadata();
}

export function convertSvg(url: string, format: ImageFormat) {
	return fetch(url).then(buf => convertImage(buf as Buffer, format, 512, true));
}
