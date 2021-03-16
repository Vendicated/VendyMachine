import postgres = require("postgres");

export const database = postgres(process.env.POSTGRES_URI);
