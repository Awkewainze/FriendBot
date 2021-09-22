import { Duration } from "@awkewainze/simpleduration";
import { Timer } from "@awkewainze/simpletimer";
import { GuildMember } from "discord.js";
import { DateTime } from "luxon";
import { singleton } from "tsyringe";

/**
 * Manages tracking users joining and leaving a voice channel.
 *
 * Singleton.
 * @category Service
 */
@singleton()
export class UserConnectionTrackingService {
    private channelTrackers: Map<string, ChannelTracker> = new Map<string, ChannelTracker>();

    userJoined(channelId: string, member: GuildMember): void {
        if (!this.channelTrackers.has(channelId)) {
            this.channelTrackers.set(channelId, new ChannelTracker(Duration.fromMinutes(2)));
        }
        this.channelTrackers.get(channelId).userJoined(member);
    }
    userLeft(channelId: string, member: GuildMember): void {
        if (!this.channelTrackers.has(channelId)) {
            this.channelTrackers.set(channelId, new ChannelTracker(Duration.fromMinutes(2)));
        }
        this.channelTrackers.get(channelId).userLeft(member);
    }
    getWhoJoined(channelId: string): Array<UserActivity> {
        if (!this.channelTrackers.has(channelId)) {
            return [];
        }
        return this.channelTrackers.get(channelId).getUsersJoined();
    }
    getWhoLeft(channelId: string): Array<UserActivity> {
        if (!this.channelTrackers.has(channelId)) {
            return [];
        }
        return this.channelTrackers.get(channelId).getUsersLeft();
    }
}

class ChannelTracker {
    private readonly usersJoined: Map<string, UserActivity> = new Map<string, UserActivity>();
    private readonly usersLeft: Map<string, UserActivity> = new Map<string, UserActivity>();
    constructor(private timeToTrackFor: Duration) {}

    userJoined(member: GuildMember): void {
        const activity = new UserActivity(member, Activity.ChannelJoin, DateTime.utc());
        this.usersJoined.set(member.id, activity);
        Timer.for(this.timeToTrackFor)
            .addCallback(() => {
                if (
                    this.usersJoined.has(member.id) &&
                    this.usersJoined.get(member.id).simpleChecksum() === activity.simpleChecksum()
                ) {
                    this.usersJoined.delete(member.id);
                }
            })
            .start();
    }
    userLeft(member: GuildMember): void {
        const activity = new UserActivity(member, Activity.ChannelLeave, DateTime.utc());
        this.usersLeft.set(member.id, activity);
        Timer.for(this.timeToTrackFor)
            .addCallback(() => {
                if (
                    this.usersLeft.has(member.id) &&
                    this.usersLeft.get(member.id).simpleChecksum() === activity.simpleChecksum()
                ) {
                    this.usersLeft.delete(member.id);
                }
            })
            .start();
    }

    getUsersJoined(): Array<UserActivity> {
        return Array.from(this.usersJoined.values());
    }
    getUsersLeft(): Array<UserActivity> {
        return Array.from(this.usersLeft.values());
    }
}

export enum Activity {
    ChannelJoin = 1,
    ChannelLeave = 2
}

export class UserActivity {
    constructor(readonly member: GuildMember, readonly activity: Activity, readonly time: DateTime) {}
    simpleChecksum(): string {
        return this.member.id + "/" + this.activity + "/" + this.time.toISO();
    }
}
