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

import path from "path";
import { createLogger, format, transports } from "winston";

const level = process.env.LOG_LEVEL || "info";
const dirname = path.join(process.cwd(), "logs");

const logFormat = format.combine(
  format.timestamp({ format: "DD/MM/YYYY HH:mm:ss" }),
  format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`)
);
const sharedOptions = {
  dirname,
  format: logFormat
};

const loggers = [
  new transports.Console({
    format: format.combine(logFormat, format.colorize({ all: true }))
  }),
  new transports.File({ ...sharedOptions, filename: "info.log", level: "info" }),
  new transports.File({ ...sharedOptions, filename: "errors.log", level: "error" })
];

if (level === "debug") loggers.push(new transports.File({ ...sharedOptions, filename: "debug.log", level: "debug" }));

export const logger = createLogger({
  level,
  transports: loggers
});
