import { Duration } from "@awkewainze/simpleduration";
import { Timer } from "@awkewainze/simpletimer";
import { Message } from "discord.js";
import { DateTime, Duration as LuxonDuration } from "luxon";
import * as path from "path";
import { inject, Lifecycle, scoped } from "tsyringe";
import {
    CachingService,
    GuildAndMemberScopedIndex,
    GuildMemberAndChannelScopedIndex,
    GuildScopedVoiceConnectionService,
    Index,
    PersistentCachingService
} from "../services";
import { getMediaDir, Permission } from "../utils";
import { StatefulCommand } from "./dev/statefulCommand";

// eslint-disable-next-line @typescript-eslint/ban-types
type State = {};

type PersistentState = {
    lastTimeCommandUsedISO: string;
};

/**
 * Sprays someone for being lewd/puny. (Mutes them for 10 seconds).
 * @category Command
 */
@scoped(Lifecycle.ResolutionScoped, "Command")
export class SprayCommand extends StatefulCommand<State, PersistentState> {
    constructor(
        @inject(GuildScopedVoiceConnectionService)
        private readonly voiceConnectionService: GuildScopedVoiceConnectionService,
        @inject("CachingService") cachingService: CachingService,
        @inject("PersistentCachingService") persistentCachingService: PersistentCachingService,
        @inject(GuildAndMemberScopedIndex) private readonly guildAndMemberScopedIndex: Index,
        @inject(GuildMemberAndChannelScopedIndex) private readonly guildMemberAndChannelScopedIndex: Index
    ) {
        super(
            cachingService,
            persistentCachingService,
            {},
            { lastTimeCommandUsedISO: DateTime.fromSeconds(0).toISO() }
        );
        this.guildAndMemberScopedIndex = this.guildAndMemberScopedIndex.addScope("SprayCommand");
        this.guildMemberAndChannelScopedIndex = this.guildMemberAndChannelScopedIndex.addScope("SprayCommand");
    }

    requiredPermissions(): Set<Permission> {
        return new Set([Permission.UseCommands, Permission.PlaySound, Permission.ModifyOtherTemporary]);
    }

    /** Triggered by `$spray *mention*`. */
    async check(message: Message): Promise<boolean> {
        return /^\$spray /i.test(message.content.trim()) && message.mentions.members.size > 0;
    }

    async execute(message: Message): Promise<void> {
        const member = message.mentions.members.first();
        const currentState = await this.getPersistentState(this.guildAndMemberScopedIndex);
        const canUseCommand =
            DateTime.fromISO(currentState.lastTimeCommandUsedISO).plus(LuxonDuration.fromObject({ hours: 3 })) <
            DateTime.now();

        if (member.voice && member.voice.channel && canUseCommand) {
            member.edit({ mute: true });
            const audioFileToPlay = path.join(getMediaDir(), "sounds", "misc", "spray-bottle.mp3");
            const connection = await this.voiceConnectionService.getOrCreateConnection(member.voice.channel);
            connection.play(audioFileToPlay, {
                volume: 0.6
            });

            currentState.lastTimeCommandUsedISO = DateTime.now().toISO();
            this.setPersistentState(this.guildAndMemberScopedIndex, { lastTimeCommandUsedISO: DateTime.now().toISO() });
            Timer.for(Duration.fromSeconds(10))
                .addCallback(() => {
                    member.edit({ mute: false });
                })
                .start();
        }
    }
}
