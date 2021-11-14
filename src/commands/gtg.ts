import { Duration } from "@awkewainze/simpleduration";
import { Timer } from "@awkewainze/simpletimer";
import { Message } from "discord.js";
import { DateTime } from "luxon";
import parseDuration from "parse-duration";
import { filter } from "rxjs";
import { inject, Lifecycle, scoped } from "tsyringe";
import winston from "winston";
import {
    CachingService,
    GuildAndMemberScopedIndex,
    GuildScopedReactionService,
    Index,
    PersistentCachingService,
    TimeZoneService
} from "../services";
import { Permission } from "../utils";
import { StatefulCommand } from "./dev/statefulCommand";

// eslint-disable-next-line @typescript-eslint/ban-types
type State = {};
// eslint-disable-next-line @typescript-eslint/ban-types
type PersistentState = {};

/**
 * Tells FriendBot to remove you from the channel if you are up later than you want.
 * @category Command
 */
@scoped(Lifecycle.ResolutionScoped, "Command")
export class GotToGoCommand extends StatefulCommand<State, PersistentState> {
    constructor(
        @inject("CachingService") cachingService: CachingService,
        @inject("PersistentCachingService") persistentCachingService: PersistentCachingService,
        @inject(GuildAndMemberScopedIndex) private readonly guildAndMemberScopedIndex: Index,
        @inject(TimeZoneService) private readonly timeZoneService: TimeZoneService,
        @inject(GuildScopedReactionService) private readonly reactionService: GuildScopedReactionService,
        @inject("Logger") private readonly logger: winston.Logger
    ) {
        super(
            cachingService,
            persistentCachingService,
            {},
            { lastTimeCommandUsedISO: DateTime.fromSeconds(0).toISO() }
        );
        this.logger = this.logger.child({ src: this.constructor.name });
        this.guildAndMemberScopedIndex = this.guildAndMemberScopedIndex.addScope(this.constructor.name);
    }

    requiredPermissions(): Set<Permission> {
        return new Set([Permission.UseCommands, Permission.ModifySelf]);
    }

    /** Triggered by `$gtg[ in] <duration or time>`. */
    async check(message: Message): Promise<boolean> {
        return /^\$gtg( (in|at))? (.*)/i.test(message.content.trim());
    }

    async execute(message: Message): Promise<void> {
        const durationOrTime = /^\$gtg( (in|at))? (?<durationOrTime>.*)/i.exec(message.content.trim()).groups
            .durationOrTime;
        let durationFromNow: number;

        if (/^\d?\d(:\d\d)?\s*(A|P)M$/i.test(durationOrTime)) {
            const groups = /^(?<hour>\d?\d)(?::(?<minute>\d\d))?\s*(?<meridiem>(?:A|P)M)$/i.exec(durationOrTime).groups;
            let { hour, minute = "00" } = groups;
            const meridiem = groups.meridiem.toUpperCase();
            if (hour.length === 1) {
                hour = "0" + hour;
            }
            if (minute.length === 1) {
                minute = "0" + minute;
            }
            const userTz = await this.timeZoneService.getUsersTimeZone(message.member.id);
            if (!userTz) {
                await message.reply(
                    "Please set your time zone using the `$tz` command before using a time in this command!"
                );
                return;
            }
            const specifiedDateTime = DateTime.fromFormat(`${hour}:${minute} ${meridiem}`, "hh:mm a", {
                zone: userTz.tzCode,
                setZone: true
            });
            if (!specifiedDateTime.isValid) {
                await message.reply("Invalid formatting, expected examples: `$gtg at 10:00 PM` or `$gtg 10 minutes`");
                return;
            }
            durationFromNow = specifiedDateTime.diffNow().toMillis();
            if (durationFromNow < 0) {
                durationFromNow = specifiedDateTime.plus({ day: 1 }).diffNow().toMillis();
            }
        } else {
            durationFromNow = parseDuration(durationOrTime);
        }

        if (durationFromNow > Duration.fromDays(1).toMilliseconds()) {
            await message.reply("Can't kick yourself more than a day out from now!");
            return;
        }

        const duration = Duration.fromMilliseconds(durationFromNow);
        // TODO only allow 1 kick request for user at a time
        const messageText =
            `You will be kicked ${GotToGoCommand.humanizeDuration(duration)}!\n` +
            (GotToGoCommand.shouldGiveWarningMessage(duration)
                ? ` You will get a ${GotToGoCommand.warnDurationFromKick.toMinutes()} minute heads up!\n`
                : "") +
            "React with ❌ to cancel this request!\n" +
            "Others can react with ☑️ to get kicked as well! Just unreact to cancel.\n" +
            "(If the creator cancels the kick, you will also not be kicked)";

        const messageReply = await message.reply(messageText);
        await messageReply.react("☑️");
        await messageReply.react("❌");
        const timer = Timer.for(duration);

        const subscription = this.reactionService
            .getScopedObservable()
            .pipe(filter(({ reaction }) => reaction.message.id === messageReply.id))
            .subscribe(x => {
                if (x.user.id === message.member.id && x.reaction.emoji.name === "❌") {
                    subscription.unsubscribe();
                    timer.stop();
                    messageReply.delete();
                    return;
                }
            });
        timer
            .addCallback(() => {
                messageReply.reactions.resolve("☑️").users.cache.forEach(user => {
                    messageReply.guild.members.resolve(user.id)?.voice?.kick("GTG");
                });
                message.member.voice?.kick("GTG");
                subscription.unsubscribe();
            })
            .start();
    }

    private static humanizeDuration(duration: Duration): string {
        const mins = duration.toMinutes();
        if (mins < 1) {
            return "very soon";
        }
        if (mins < 10) {
            return "in a few minutes";
        }
        if (mins < 50) {
            return "in less than an hour";
        }
        if (mins < 70) {
            return "in about an hour";
        }
        if (mins < 150) {
            return "in a couple hours";
        }
        if (duration.toHours() < 6) {
            return "in a few hours";
        }
        return "eventually";
    }

    private static readonly warnDurationFromKick = Duration.fromMinutes(15);
    private static shouldGiveWarningMessage(duration: Duration): boolean {
        return duration.toMilliseconds() > this.warnDurationFromKick.multiply(2).toMilliseconds();
    }
}
