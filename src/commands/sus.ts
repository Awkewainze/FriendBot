import { Duration } from "@awkewainze/simpleduration";
import { Timer } from "@awkewainze/simpletimer";
import { Message, MessageEmbed, Snowflake } from "discord.js";
import { DateTime, Duration as LuxonDuration } from "luxon";
import { filter } from "rxjs";
import { inject, Lifecycle, scoped } from "tsyringe";
import { GuildScopedReactionService, ReactionService } from "../services";
import {
    BaseColor,
    Emojis,
    getExtraInfo,
    makeUniqueColors,
    MemberWithExtraInfo,
    Permission,
    stripQuotes
} from "../utils";
import { Command } from "./command";

/**
 * Starts a vote to eject the imposter(s) from the ship!
 * @category Command
 */
@scoped(Lifecycle.ResolutionScoped, "Command")
export class SusCommand extends Command {
    constructor(@inject(GuildScopedReactionService) private readonly reactionService: ReactionService) {
        super();
    }
    requiredPermissions(): Set<Permission> {
        return new Set([Permission.UseCommands, Permission.ModifyOtherTemporary]);
    }
    /** Trigger by a message containing the word `sus` and at least one user mention. */
    async check(message: Message): Promise<boolean> {
        return (
            /\bsus\b/i.test(stripQuotes(message.content)) &&
            message.mentions.users.size > 0 &&
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
                DateTime.utc()
                    .plus(LuxonDuration.fromObject({ minutes: 2 }))
                    .setLocale("en-us")
                    .toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)
            )
        );
        await Promise.all(colors.map(x => voteMsg.react(x.getAmongUsDefaultEmojiSnowflake())));
        await voteMsg.react(Emojis.SkipVote.snowflake);
        const userVotedFor = new Map<string, Snowflake>();

        // Only allow 1 vote per person by removing previous votes.
        const subscription = this.reactionService
            .getObservable()
            .pipe(filter(x => x.reaction.message.id === voteMsg.id))
            .subscribe(async x => {
                if (userVotedFor.has(x.user.id)) {
                    await voteMsg.reactions.resolve(userVotedFor.get(x.user.id)).users.remove(x.user.id);
                }
                userVotedFor.set(x.user.id, x.reaction.emoji.id);
            });

        Timer.for(Duration.fromMinutes(2))
            .addCallback(() => this.tallyVotes([caller, ...susPeeps], colors, voteMsg))
            .addCallback(() => subscription.unsubscribe())
            .start();
    }

    private getUniqueMentions(
        caller: MemberWithExtraInfo,
        susPeeps: Array<MemberWithExtraInfo>
    ): Array<MemberWithExtraInfo> {
        const uniqueIds = [caller, ...susPeeps]
            .map(x => x.member.id)
            .reduce((prev, curr) => prev.add(curr), new Set<string>());
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

        const skipVotes = msg.reactions.resolve(Emojis.SkipVote.snowflake).count;
        const ejected = mostVotes.length === 1 && mostVotes[0].count > skipVotes ? mostVotes[0].person : null;
        let firstLine: string, secondLine: string;
        if (ejected !== null) {
            await ejected.member.guild.members.resolve(ejected.member)?.voice.kick("User was kinda sus");
            firstLine = `${ejected.name} was ejected.`;
            const isImposter = Math.random() < 0.5;
            secondLine = `${ejected.pronouns[0].subjective} ${ejected.pronouns[0].plural ? "were" : "was"}${
                isImposter ? " " : " not "
            }the Imposter.`;
        } else {
            let reason: string;
            if (skipVotes > mostVotes[0].count) {
                reason = "Skipped";
            } else if (mostVotes.length > 0) {
                reason = "Tied";
            }
            firstLine = `No one was ejected. (${reason})`;
            secondLine = "";
        }

        msg.channel.send(
            new MessageEmbed().setTitle("Emergency meeting results!").setDescription(firstLine + "\n" + secondLine)
        );
    }
}
