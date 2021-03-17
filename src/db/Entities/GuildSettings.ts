import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class GuildSettings {
	@PrimaryColumn("bigint")
	id: string;

	@Column("varchar", {
		length: 20,
		array: true
	})
	prefixes: string[];
}
