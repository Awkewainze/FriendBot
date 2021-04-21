import { Message } from "discord.js";
import { DateTime } from "luxon";
import * as path from "path";
import { inject, injectable } from "tsyringe";
import {
    CachingService,
    GuildAndMemberScopedIndex,
    GuildMemberAndChannelScopedIndex,
    GuildScopedVoiceConnectionService,
    Index,
    PersistentCachingService
} from "../services";
import { Duration, getMediaDir, Timer } from "../utils";
import { StatefulCommand } from "./statefulCommand";

type State = {};

type PersistentState = {
    lastTimeCommandUsedISO: string;
};

/**
 * Sprays someone for being lewd/puny. (Mutes them for 10 seconds).
 * @category Command
 */
@injectable()
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

    /** Triggered by `$spray *mention*`. */
    async check(message: Message): Promise<boolean> {
        return /^\$spray /i.test(message.content.trim()) && message.mentions.members.size > 0;
    }

    async execute(message: Message): Promise<void> {
        const member = message.mentions.members.first();
        const currentState = await this.getPersistentState(this.guildAndMemberScopedIndex);
        const canUseCommand =
            DateTime.fromISO(currentState.lastTimeCommandUsedISO).plus(Duration.fromHours(3).toLuxonDuration()) <
            new DateTime();

        if (member.voice && member.voice.channel && canUseCommand) {
            member.edit({ mute: true });
            const audioFileToPlay = path.join(getMediaDir(), "sounds", "misc", "spray-bottle.mp3");
            const connection = await this.voiceConnectionService.getOrCreateConnection(member.voice.channel);
            connection.play(audioFileToPlay, {
                volume: 0.6
            });
            currentState.lastTimeCommandUsedISO = new DateTime().toISO();
            this.setPersistentState(this.guildAndMemberScopedIndex, { lastTimeCommandUsedISO: new DateTime().toISO() });
            Timer.for(Duration.fromSeconds(10))
                .addCallback(() => {
                    member.edit({ mute: false });
                })
                .start();
        }
    }
}
