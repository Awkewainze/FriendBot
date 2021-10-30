import { Duration } from "@awkewainze/simpleduration";
import { Timer } from "@awkewainze/simpletimer";
import { GuildChannel, Message } from "discord.js";
import { Lifecycle, scoped } from "tsyringe";
import { Emojis, Permission, selectRandom } from "../../utils";
import { Command } from "../command";

/** @ignore */
@scoped(Lifecycle.ResolutionScoped, "Command")
export class ReactToPetsCommand extends Command {
    requiredPermissions(): Set<Permission> {
        return new Set();
    }

    async check(message: Message): Promise<boolean> {
        if (!/pet/i.test((message.channel as GuildChannel).name)) return false;
        await Timer.immediateAwaitable(Duration.fromSeconds(3));
        message = message.channel.messages.resolve(message);
        return message.attachments.size + message.embeds.length > 0;
    }

    async execute(message: Message): Promise<void> {
        await message.react(selectRandom(Emojis.PositiveReactionCharacters));
    }

    priority(): number {
        return -1000;
    }
}
