import { Message } from "discord.js";
import { Command } from "../commands";
import { insertInSortedLocation } from "../utils";

/**
 * Manages the order and execution of commands.
 * @category Service
 */
export class CommandService {
    private commands: Array<Command> = [];

    /**
     * Adds a command to be checked and executed.
     * @param command Command to be added to being managed by this service.
     */
    public registerCommand(command: Command): void {
        insertInSortedLocation(this.commands, command, c => c.priority() * -1);
    }

    /**
     * Runs through the list of managed commands and checks for if the given message should trigger a command.
     * @param message Message to check then execute if passes command requirements.
     */
    public async execute(message: Message): Promise<void> {
        for (const command of this.commands) {
            if (command.check(message)) {
                await command.execute(message);
                if (command.exclusive()) {
                    return;
                }
            }
        }
    }
}
