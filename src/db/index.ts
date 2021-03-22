import path from "path";
import "reflect-metadata"; // global.Reflect polyfill for typeorm decorators
import { Connection, createConnection, EntityTarget } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { IMessage } from "../IMessage";
import { GuildSettings } from "./Entities/GuildSettings";
import { UserSettings } from "./Entities/User";

export class Database {
	public connection: Connection;

	public async init() {
		this.connection = await createConnection({
			type: "postgres",
			host: process.env.POSTGRES_HOST,
			database: process.env.POSTGRES_DB,
			username: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			port: parseInt(process.env.POSTGRES_PORT),
			entities: [path.join(__dirname, "Entities", "*.js")],
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
		const guildPrefixes = (msg.guild ? await this.getById(GuildSettings, msg.guild.id).then(s => s?.prefixes) : null) ?? [];

		const all = userPrefixes.concat(guildPrefixes);

		if (!all.length) all.push(process.env.DEFAULT_PREFIX);

		return { all, guild: guildPrefixes, user: userPrefixes };
	}
}
