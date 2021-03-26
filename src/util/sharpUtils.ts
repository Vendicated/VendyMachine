import sharp from "sharp";
import { bytesRegex } from "./regex";

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

export async function getFormat(input: Buffer) {
	const meta = await sharp(input).metadata();
	return meta.format;
}
export async function convert(input: Buffer) {
	//
}

// info = fileSize / (width * height);
// newFileSize = (fileSize / (width * height)) * (newWidth * newHeight) * c
//
