declare namespace NodeJS {
	interface ProcessEnv {
		DEFAULT_PREFIX: string;
		TOKEN: string;
		POSTGRES_URI: string;
		NODE_ENV: "production" | "development";
		ERROR_WEBHOOK: string;
		INFO_WEBHOOK: string;
	}
}
