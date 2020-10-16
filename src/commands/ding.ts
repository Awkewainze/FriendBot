import { Message } from "discord.js";
import * as path from "path";
import { inject, injectable } from "tsyringe";
import { CachingService, GuildScopedIndex, GuildScopedVoiceConnectionService, Index } from "../services";
import { Duration, getMediaDir, getRandomFileFromDir, Timer } from "../utils";
import { Command } from "./command";

/**
 * Command to play "Ding"s from Destiny 2 when The Drifter starts a match of Gambit.
 *
 * [This](https://www.youtube.com/watch?v=dbKwMq8OoRs) but indefinitely and dings are randomized.
 * @category Command
 */
@injectable()
export class DingCommand extends Command {
    private static readonly DingFolder = path.join(getMediaDir(), "sounds", "dings");

    constructor(
        @inject(GuildScopedVoiceConnectionService)
        private readonly voiceConnectionService: GuildScopedVoiceConnectionService,
        @inject("CachingService") private readonly cachingService: CachingService,
        @inject(GuildScopedIndex) private readonly index: Index
    ) {
        super();
        this.index = this.index.addScope("DingCommand");
    }

    /** Triggered by `ding (start|stop)` */
    async check(message: Message): Promise<boolean> {
        return /^\$ding (start|stop)$/i.test(message.content.trim());
    }

    /** Start or stop dings in current voice channel. */
    async execute(message: Message): Promise<void> {
        const currentUserVoiceChannel = message?.member?.voice?.channel;
        if (!currentUserVoiceChannel) return;

        if (/stop/i.test(message.content)) {
            await this.cachingService.set(this.index.getKey(Keys.Enabled), false);
            return;
        }

        await this.cachingService.set(this.index.getKey(Keys.Enabled), true);
        await this.voiceConnectionService.getOrCreateConnection(currentUserVoiceChannel);
        this.voiceConnectionService.subscribeToDisconnect(() => {
            this.cachingService.set(this.index.getKey(Keys.Enabled), false);
        });
        await this.playDingIndefinitely();
    }

    private async playDingIndefinitely(): Promise<void> {
        try {
            while (await this.cachingService.get(this.index.getKey(Keys.Enabled))) {
                const connection = this.voiceConnectionService.getConnection();
                const stream = connection.play(await getRandomFileFromDir(DingCommand.DingFolder), {
                    volume: 0.4
                });
                await new Promise(resolve => {
                    stream.once("finish", resolve);
                });
                await Timer.for(Duration.fromMilliseconds(250)).start().asAwaitable();
            }
        } catch (err) {
            // connection not found, set enabled to false.
            await this.cachingService.set(this.index.getKey(Keys.Enabled), false);
        }
    }
}

/* @ignore */
class Keys {
    static Enabled = "Enabled";
}
