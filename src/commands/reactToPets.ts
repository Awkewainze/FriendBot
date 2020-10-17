import { GuildChannel, Message } from "discord.js";
import { injectable } from "tsyringe";
import { Duration, Emojis, selectRandom, Timer } from "../utils";
import { Command } from "./command";

@injectable()
export class ReactToPetsCommand extends Command {
    async check(message: Message): Promise<boolean> {
        return /pet/i.test((message.channel as GuildChannel).name);
    }

    async execute(message: Message): Promise<void> {
        await Timer.for(Duration.fromSeconds(3)).start().asAwaitable();
        message = message.channel.messages.resolve(message);
        if (message.attachments.size + message.embeds.length > 0) {
            await message.react(selectRandom(Emojis.PositiveReactionCharacters));
        }
    }
}
