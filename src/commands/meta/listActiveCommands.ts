import { Message } from "discord.js";
import { container, injectable, Lifecycle, scoped } from "tsyringe";
import { CommandService } from "../../services";
import { Command } from "../command";

/**
 * List the active commands.
 * @category Command
 */
@injectable()
@scoped(Lifecycle.ResolutionScoped, "Command")
export class ListActiveCommandsCommand extends Command {
    /** Triggered by `$command-list`. */
    async check(message: Message): Promise<boolean> {
        return /^\$command-list/i.test(message.content.trim());
    }

    async execute(message: Message): Promise<void> {
        const response = container
            .createChildContainer()
            .register("GuildId", { useValue: message.guild.id })
            .register("GuildMemberId", { useValue: message.member.id })
            .register("MessageChannelId", { useValue: message.channel.id })
            .resolve(CommandService)
            .Commands.map(x => x.constructor.name)
            .map(x => x.replace(/Command$/, ""))
            .map(x => `\`${x}\``)
            .join(", ");
        await message.reply(response);
    }
}
