import { Message } from "discord.js";
import { container } from "tsyringe";
import { CommandService } from "../services";

export async function OnMessage(message: Message): Promise<void> {
    if (message.author.bot) return;
    if (message.guild) {
        container
            .createChildContainer()
            .register("GuildId", { useValue: message.guild.id })
            .register("GuildMemberId", { useValue: message.member.id })
            .register("MessageChannelId", { useValue: message.channel.id })
            .resolve(CommandService)
            .execute(message);
    }
}
