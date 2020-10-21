// eslint-disable-next-line @typescript-eslint/no-var-requires
require("source-map-support").install();
import { Client as DiscordClient } from "discord.js";
import "reflect-metadata";
import { container } from "tsyringe";
import { CONFIG } from "./config";
import { OnGuildMemberAdd, OnMessage } from "./events";
import "./injects";
import { ActivityService } from "./services";

/** @ignore */
function main() {
    const client = new DiscordClient();

    container.register("DiscordClient", { useValue: client });
    client.on("ready", async () => {
        // eslint-disable-next-line no-console
        console.log("Online");

        const activityService: ActivityService = container.resolve(ActivityService);
        //Initialize activity service and start interval
        await activityService.initializeActivityRandomization();
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
