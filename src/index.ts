// eslint-disable-next-line @typescript-eslint/no-var-requires
require("source-map-support").install();
import { Client as DiscordClient } from "discord.js";
import "reflect-metadata";
import { CONFIG } from "./config";
import { OnGuildMemberAdd, OnMessage } from "./events";
import "./injects";

/** @ignore */
function main() {
    const client = new DiscordClient();

    client.on("ready", async () => {
        // eslint-disable-next-line no-console
        console.log("Online");
        client.user.setPresence({
            status: "online",
            activity: {
                name: "you",
                type: "WATCHING",
                url: "https://github.com/Awkewainze/FriendBot"
            }
        });
    });

    client.on("guildMemberAdd", OnGuildMemberAdd);
    client.on("message", OnMessage);

    client.login(CONFIG.DISCORD.LOGIN_TOKEN);
}

main();
