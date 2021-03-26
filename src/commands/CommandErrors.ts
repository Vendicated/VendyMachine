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
		this.message = `Sorry, I can't do that. Needed permissions: \`${permissions.map(p => toTitleCase(p)).join("`, `")}\``;
	}
}

export class UserPermissionError extends CommandError {
	public constructor(permissions: PermissionString[]) {
		super();
		this.name = "UserPermissionError";
		this.message = `You are not allowed to do this. Required permissions: \`${permissions.map(p => toTitleCase(p)).join("`, `")}\``;
	}
}
