import { Message } from "discord.js";
import { injectAll, singleton } from "tsyringe";
import { Command } from "../commands";

/**
 * Manages the order and execution of commands.
 * @category Service
 */
@singleton()
export class CommandService {
    constructor(@injectAll("Command") private readonly commands: Array<Command>) {
        this.commands.sort(c => c.priority() * -1);
    }

    /**
     * Runs through the list of managed commands and checks for if the given message should trigger a command.
     * @param message Message to check then execute if passes command requirements.
     */
    async execute(message: Message): Promise<void> {
        for (const command of this.commands) {
            if (await command.check(message)) {
                await command.execute(message);
                if (command.exclusive()) {
                    return;
                }
            }
        }
    }
}
