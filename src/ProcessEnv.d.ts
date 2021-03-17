declare namespace NodeJS {
	interface ProcessEnv {
		DEFAULT_PREFIX: string;
		TOKEN: string;
		NODE_ENV: "production" | "development";
		ERROR_WEBHOOK: string;
		INFO_WEBHOOK: string;
		POSTGRES_USER: string;
		POSTGRES_PASSWORD: string;
		POSTGRES_DB: string;
		POSTGRES_PORT: string;
	}
}
