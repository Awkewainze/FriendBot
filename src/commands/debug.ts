import { Message } from "discord.js";
import { inject, injectable } from "tsyringe";
import { GuildScopedIndex, Index } from "../services";
import { Command } from "./command";

/** @ignore */
@injectable()
export class DebugCommand extends Command {
    constructor(@inject(GuildScopedIndex) private readonly index: Index) {
        super();
        this.index = index.addScope("DebugCommand");
    }
    async check(message: Message): Promise<boolean> {
        console.log(message.content);
        return /^debug/i.test(message.content);
    }

    async execute(message: Message): Promise<void> {
        // eslint-disable-next-line no-console
        console.log(message.guild.id);
        console.log(message.member.id);
        console.log(message.member.user.id);
    }
}
