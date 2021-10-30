import { Message } from "discord.js";
import { Lifecycle, scoped } from "tsyringe";
import { Emojis, Permission } from "../../utils";
import { Command } from "../command";

/** @ignore */
@scoped(Lifecycle.ResolutionScoped, "Command")
export class OnHowdyCommand extends Command {
    requiredPermissions(): Set<Permission> {
        return new Set();
    }

    async check(message: Message): Promise<boolean> {
        return /howdy|yeehaw|cow(boy|girl|poke)|y'all|par(t|d)ner/i.test(message.content);
    }

    async execute(message: Message): Promise<void> {
        await message.react(Emojis.Howdy.snowflake);
    }
}
