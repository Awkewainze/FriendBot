// eslint-disable-next-line @typescript-eslint/no-var-requires
require("source-map-support").install();
import { Client as DiscordClient } from "discord.js";
import "reflect-metadata";
import { container } from "tsyringe";
import { CONFIG } from "./config";
import "./injects";
import { CommandService } from "./services";

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

    client.on("message", async message => {
        if (message.author.bot) return;
        if (message.guild) {
            container
                .createChildContainer()
                .register("GuildId", { useValue: message.guild.id })
                .register("GuildMemberId", { useValue: message.member.id })
                .register("MessageChannelId", { useValue: message.channel.id })
                .resolve(CommandService)
                .execute(message);
        }
    });

    client.login(CONFIG.DISCORD.LOGIN_TOKEN);
}

main();
