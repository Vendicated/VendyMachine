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
import "reflect-metadata"; // global.Reflect polyfill for typeorm decorators
import { Connection, createConnection, EntityTarget } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { IMessage } from "../IMessage";
import { logger } from "../Logger";
import { GuildSettings } from "./Entities/GuildSettings";
import { UserSettings } from "./Entities/UserSettings";

export class Database {
  public connection: Connection;

  public async init() {
    logger.debug("Creating database connection...");
    this.connection = await createConnection({
      type: "postgres",
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      port: parseInt(process.env.POSTGRES_PORT),
      entities: [path.join(__dirname, "Entities", "*.[jt]s")],
      synchronize: true,
      logging: false,
      cache: true
    });
  }

  public getById<T>(target: EntityTarget<T>, id: string) {
    return this.connection.getRepository(target).createQueryBuilder().where("id = :id", { id }).getOne();
  }

  public async updateById<T>(target: EntityTarget<T>, id: string, values: QueryDeepPartialEntity<T>) {
    const builder = this.connection.createQueryBuilder();

    let results = await builder.update(target).set(values).where("id = :id", { id }).execute();

    // Create row if not exists
    if (!results.affected) {
      results = await builder
        .insert()
        .into(target)
        .values({ id, ...values })
        .onConflict('("id") DO NOTHING')
        .execute();
    }

    return results;
  }

  public async getPrefixes(msg: IMessage) {
    const userPrefixes = (await this.getById(UserSettings, msg.author.id).then(s => s?.prefixes)) ?? [];
    const guildPrefixes = (msg.guild ? await this.getById(GuildSettings, msg.guild.id).then(s => s?.prefixes) : null) ?? [process.env.DEFAULT_PREFIX];

    const all = userPrefixes.concat(guildPrefixes);

    return { all, guild: guildPrefixes, user: userPrefixes };
  }
}
