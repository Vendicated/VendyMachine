import { Client } from "./Client";

const client = new Client();

void client.registerCommands().registerDefaultHandlers().connect();
