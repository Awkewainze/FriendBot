import { Message } from "discord.js";
import { inject, injectable } from "tsyringe";
import winston from "winston";
import { Command } from "./command";

/** @ignore */
@injectable()
export class DebugCommand extends Command {
    constructor(@inject("Logger") private readonly logger: winston.Logger) {
        super();
        this.logger = this.logger.child({ src: this.constructor.name });
    }

    async check(message: Message): Promise<boolean> {
        return /^debug/i.test(message.content);
    }

    async execute(message: Message): Promise<void> {
        this.logger.debug({ message: "Debugger check", content: message.content, author: message.author.username });
    }
}
