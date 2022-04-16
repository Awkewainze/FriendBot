// eslint-disable-next-line @typescript-eslint/no-var-requires
require("source-map-support").install();

import { Client as DiscordClient, Intents } from "discord.js";
import { onShutdown } from "node-graceful-shutdown";
import "reflect-metadata";
import { container } from "tsyringe";
import winston from "winston";
import { boot } from "./boot";
import { CONFIG } from "./config";
import { OnGuildMemberAdd, OnGuildMemberRemove, OnMessage, OnReactionAdd, OnVoiceStateUpdate } from "./events";
import "./injects";
import { ActivityService } from "./services";

/** @ignore */
async function main(logger: winston.Logger) {
    await boot(container);

    const client = new DiscordClient({
        intents: Intents.ALL
    });
    logger.info("Discord client starting");

    container.register(DiscordClient, { useValue: client });
    client.on("ready", async () => {
        //Initialize activity service and start interval
        const activityService: ActivityService = container.resolve(ActivityService);
        activityService.initializeActivityRandomization();
        client.user.setPresence({
            status: "online",
            activities: [activityService.getCurrentActivity()]
        });
        const shouldRemoveRole = process.argv.includes("-doIt");
        if (shouldRemoveRole) {
            client.guilds
                .resolve("742958951426949221")
                .members.resolve("181223459202924556")
                .roles.remove("743265429836791878");
            logger.info("Did it");
            client.destroy();
            return;
        }

        logger.info("Discord client ready");
    });

    client.on("guildMemberAdd", OnGuildMemberAdd);
    client.on("guildMemberRemove", OnGuildMemberRemove);
    client.on("message", OnMessage);
    client.on("messageReactionAdd", OnReactionAdd);
    client.on("voiceStateUpdate", OnVoiceStateUpdate);

    client.login(CONFIG.DISCORD.LOGIN_TOKEN);

    onShutdown("DiscordClient", async () => {
        client.destroy();
    });
}

main(container.resolve("Logger"));
