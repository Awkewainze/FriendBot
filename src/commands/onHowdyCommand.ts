import { Message } from "discord.js";
import { injectable } from "tsyringe";
import { Emojis } from "../utils";
import { Command } from "./command";

/** @ignore */
@injectable()
export class OnHowdyCommand extends Command {
    async check(message: Message): Promise<boolean> {
        return /howdy|yeehaw|cow(boy|girl|poke)|y'all|par(t|d)ner/i.test(message.content);
    }

    async execute(message: Message): Promise<void> {
        await message.react(Emojis.Howdy.snowflake);
    }
}
