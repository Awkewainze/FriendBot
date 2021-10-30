import { Client as DiscordClient } from "discord.js";

export async function initialize(client: DiscordClient): Promise<void> {
    client.guilds.cache.forEach(guild => {
        guild.roles.cache.values;
    });
}
