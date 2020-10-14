// eslint-disable-next-line @typescript-eslint/no-var-requires
require("source-map-support").install();

import { Client as DiscordClient } from "discord.js";
import {
    DingCommand,
    DisconnectCommand,
    GoldWatchCommand,
    InspectCommand,
    SusCommand,
    VillagerCommand
} from "./commands";
import { DebugCommand } from "./commands/debug";
import { CONFIG } from "./config";
import { CommandService } from "./services";

/** @ignore */
function main() {
    const client = new DiscordClient();
    const commandService = new CommandService();
    commandService.registerCommand(new DingCommand());
    commandService.registerCommand(new DisconnectCommand());
    commandService.registerCommand(new GoldWatchCommand());
    commandService.registerCommand(new VillagerCommand());
    commandService.registerCommand(new SusCommand());
    commandService.registerCommand(new InspectCommand());
    commandService.registerCommand(new DebugCommand());

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
        commandService.execute(message);
    });

    client.login(CONFIG.DISCORD.LOGIN_TOKEN);
}

main();
