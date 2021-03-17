import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class UserSettings {
	@PrimaryColumn("bigint")
	id: string;

	@Column("varchar", {
		length: 20,
		array: true
	})
	prefixes: string[];

	@Column("enum", { enum: ["png", "jpeg", "webp"], default: "webp" })
	imageFormat: "png" | "jpeg" | "webp";

	@Column("bool", { default: false })
	overrideExisting: boolean;
}
