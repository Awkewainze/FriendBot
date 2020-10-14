import { Message, MessageEmbed } from "discord.js";
import moment from "moment";
import { BaseColor, getExtraInfo, makeUniqueColors, MemberWithExtraInfo, stripQuotes, Timer } from "../utils";
import { Command } from "./command";

/**
 * Starts a vote to eject the imposter(s) from the ship!
 * @category Command
 */
export class SusCommand extends Command {
    /** Trigger by a message containing the word `sus` and at least one user mention. */
    check(message: Message): boolean {
        return (
            !!(/\bsus\b/i.test(stripQuotes(message.content)) && message.mentions.users.size > 0) &&
            message.mentions.users.first().id !== message.author.id
        );
    }
    /** Create a vote to eject sus users from caller and mentions. */
    async execute(message: Message): Promise<void> {
        const caller = getExtraInfo(message.member);
        let susPeeps = message.mentions.members.map(x => getExtraInfo(x));
        susPeeps = this.getUniqueMentions(caller, susPeeps);
        const colors = makeUniqueColors([
            caller.colors.map(x => x.getColorEnum()),
            ...susPeeps.map(x => x.colors.map(y => y.getColorEnum()))
        ]).map(BaseColor.getColor);
        const voteMsg = await message.channel.send(
            this.createEmbed(caller, susPeeps, colors).addField(
                "Vote closes 2 mins after this message is sent!",
                moment().utc().add(2, "minutes").format("HH:mm:ss UTC")
            )
        );
        await Promise.all(colors.map(x => voteMsg.react(x.getAmongUsDefaultEmojiSnowflake())));
        new Timer(120000).addCallback(() => this.tallyVotes([caller, ...susPeeps], colors, voteMsg)).start();
    }

    private getUniqueMentions(
        caller: MemberWithExtraInfo,
        susPeeps: Array<MemberWithExtraInfo>
    ): Array<MemberWithExtraInfo> {
        const uniqueIds = [caller, ...susPeeps]
            .map(x => x.member.id)
            .reduce((aggr, curr) => {
                return aggr.add(curr);
            }, new Set<string>());
        uniqueIds.delete(caller.member.id);
        return Array.from(uniqueIds).map(x => susPeeps.find(sus => sus.member.id === x));
    }

    private createEmbed(
        caller: MemberWithExtraInfo,
        susPeeps: Array<MemberWithExtraInfo>,
        colors: Array<BaseColor>
    ): MessageEmbed {
        const colorsClone = [...colors];
        return new MessageEmbed()
            .setTitle(`${caller.name} has called an emergency meeting!`)
            .setDescription(
                `${caller.name} (${colorsClone.shift().getString()}) thinks ${this.susToFullString(
                    susPeeps,
                    colorsClone
                )} ${colorsClone.length > 1 ? "are" : "is"} kinda sus, let's get one of them outta here!`
            )
            .setColor(caller.member.displayColor)
            .setThumbnail("https://i.imgur.com/hlLcgdh.png");
    }

    private susToFullString(sus: Array<MemberWithExtraInfo>, colors: Array<BaseColor>): string {
        return colors.map((color, index) => this.susToString(sus[index], color)).join(", ");
    }

    private susToString(sus: MemberWithExtraInfo, color: BaseColor): string {
        return `${sus.name} (${color.getString()})`;
    }

    private async tallyVotes(peeps: Array<MemberWithExtraInfo>, colors: Array<BaseColor>, msg: Message): Promise<void> {
        type ReactionInfo = {
            person: MemberWithExtraInfo;
            color: BaseColor;
            count: number;
        };
        const mostVotes = colors
            .map(
                (color, index) =>
                    ({
                        person: peeps[index],
                        color: color,
                        count: msg.reactions.resolve(color.getAmongUsDefaultEmojiSnowflake()).count
                    } as ReactionInfo)
            )
            .reduce((prev, curr) => {
                if (prev.length === 0 || curr.count > prev[0].count) return [curr];
                if (prev[0].count > curr.count) return prev;
                prev.push(curr);
                return prev;
            }, [] as Array<ReactionInfo>);

        const isImposter = Math.random() < 0.5;
        const ejected = mostVotes.length === 1 ? mostVotes[0].person : null;
        const firstLine = `${ejected !== null ? ejected.name : "No one"} was ejected.`;
        const secondLine =
            ejected !== null
                ? `${ejected.pronouns[0].subjective} ${ejected.pronouns[0].plural ? "were" : "was"}${
                      isImposter ? " " : " not "
                  }the Imposter.`
                : "";
        msg.channel.send(
            new MessageEmbed().setTitle("Emergency meeting results!").setDescription(firstLine + "\n" + secondLine)
        );
    }
}
