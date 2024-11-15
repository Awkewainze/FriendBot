import "discord.js";

declare module "discord.js" {
	interface Client {
		// commands: Collection<string, Command>;
	}
}
// Type safety to env variables
declare module "bun" {
	interface Env {
		DISCORD_LOGIN_TOKEN: string;
		DISCORD_APPLICATION_ID: string;
	}
}
