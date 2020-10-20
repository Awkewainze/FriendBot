// eslint-disable-next-line @typescript-eslint/no-var-requires
require("source-map-support").install();
import { Client as DiscordClient } from "discord.js";
import "reflect-metadata";
import { CONFIG } from "./config";
import { OnGuildMemberAdd, OnMessage } from "./events";
import "./injects";
import { CommandService } from "./services";
import { ActivityService } from "./services/activityService";

/** @ignore */
function main() {
    const client = new DiscordClient();

    client.on("ready", async () => {
        // eslint-disable-next-line no-console
        console.log("Online");

        const activityService: ActivityService = container.resolve(ActivityService);
        //Initialize activity service and start interval
        activityService.initializeActivityTimeout(client);
        client.user.setPresence({
            status: "online",
            activity: activityService.getCurrentActivity()
        });
    });

    client.on("guildMemberAdd", OnGuildMemberAdd);
    client.on("message", OnMessage);

    client.login(CONFIG.DISCORD.LOGIN_TOKEN);
}

main();
