import { Message } from "discord.js";
import { inject, injectAll, singleton } from "tsyringe";
import winston from "winston";
import { Command } from "../commands";

/**
 * Manages the order and execution of commands.
 * @category Service
 */
@singleton()
export class CommandService {
    constructor(
        @injectAll("Command") private readonly commands: Array<Command>,
        @inject("Logger") private readonly logger: winston.Logger
    ) {
        this.commands.sort(c => c.priority() * -1);
        this.logger = this.logger.child({ src: "CommandService" });
    }

    /**
     * Runs through the list of managed commands and checks for if the given message should trigger a command.
     * @param message Message to check then execute if passes command requirements.
     */
    async execute(message: Message): Promise<void> {
        for (const command of this.commands) {
            if (await command.check(message)) {
                this.logger.info({
                    message: `Command executed - ${command.constructor.name} by ${message.author.username}`,
                    fullMessage: message.toString(),
                    command: command.constructor.name,
                    caller: {
                        id: message.author.id,
                        username: message.author.username
                    }
                });
                await command.execute(message);
                if (command.exclusive()) {
                    return;
                }
            }
        }
    }

    private messagePrettify(message: Message) {
        message.toString();
    }
}
