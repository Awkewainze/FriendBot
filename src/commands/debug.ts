import { Message } from "discord.js";
import { Command } from "./command";

/** @ignore */
export class DebugCommand extends Command {
    check(message: Message): boolean {
        return /^\s*debug/i.test(message.content);
    }

    async execute(message: Message): Promise<void> {
        // eslint-disable-next-line no-console
        console.log(message);
    }
}
