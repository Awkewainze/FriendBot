import { Message, MessageEmbed } from "discord.js";
import { DateTime } from "luxon";
import { injectable } from "tsyringe";
import { getExtraInfo } from "../utils";
import { Command } from "./command";

/**
 * Shows additional info for user in chat.
 * @category Command
 */
@injectable()
export class InspectCommand extends Command {
    /** Triggered by `inspect @user`. */
    async check(message: Message): Promise<boolean> {
        return /^\s*inspect\b/i.test(message.content) && message.mentions.members.size > 0;
    }
    /** Send user info to message chat */
    async execute(message: Message): Promise<void> {
        if (message.mentions.members.size === 0) return;
        const info = getExtraInfo(message.mentions.members.first());
        const embed = new MessageEmbed()
            .setColor(info.member.displayColor)
            .setThumbnail(info.member.user.avatarURL())
            .addField(`${info.member.user.tag}`, `${info.member.user}`, true)
            .addField("Name:", info.name, true)
            .addField("ID:", `${info.member.user.id}`, true)
            .addField("Status:", `${info.member.user.presence.status}`, true)
            .addField("Pronouns:", info.pronouns.map(x => x.pronounDisplayName).join(", "), true);
        if (info.member.user.bot) {
            embed.addField("Bot:", "This is a bot!", true);
        }
        embed
            .addField(
                "Joined The Server On:",
                `${DateTime.fromJSDate(info.member.joinedAt).setLocale("en-us").toLocaleString()}`,
                true
            )
            .addField(
                "Account Created On:",
                `${DateTime.fromJSDate(info.member.user.createdAt).setLocale("en-us").toLocaleString()}`,
                true
            )
            .setFooter(`Replying to ${message.author.username}#${message.author.discriminator}`);
        message.channel.send({ embed });
    }
}
