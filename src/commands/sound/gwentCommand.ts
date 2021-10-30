import { Duration } from "@awkewainze/simpleduration";
import { Timer } from "@awkewainze/simpletimer";
import { Message } from "discord.js";
import { inject, Lifecycle, scoped } from "tsyringe";
import winston from "winston";
import {
    CachingService,
    GuildScopedIndex,
    GuildScopedVoiceConnectionService,
    Index,
    PlexService
} from "../../services";
import { cryptoSelectRandom, Permission } from "../../utils";
import { Command } from "../command";

/**
 * Play Gwent music indefinitely.
 * @category Command
 */
@scoped(Lifecycle.ResolutionScoped, "xCommand")
export class GwentCommand extends Command {
    constructor(
        @inject(GuildScopedVoiceConnectionService)
        private readonly voiceConnectionService: GuildScopedVoiceConnectionService,
        @inject(PlexService)
        private readonly plexService: PlexService,
        @inject("CachingService") private readonly cachingService: CachingService,
        @inject(GuildScopedIndex) private readonly index: Index,
        @inject("Logger") private readonly logger: winston.Logger
    ) {
        super();
        this.index = index.addScope(this.constructor.name);
        this.logger = this.logger.child({ src: this.constructor.name });
    }

    requiredPermissions(): Set<Permission> {
        return new Set([Permission.UseCommands, Permission.PlaySound]);
    }

    /** Triggered by `$gwent (start|stop)` */
    async check(message: Message): Promise<boolean> {
        return /^\$gwent (start|stop)$/i.test(message.content.trim());
    }

    /** Starts or stops Gwent music in current voice channel. */
    async execute(message: Message): Promise<void> {
        const currentUserVoiceChannel = message?.member?.voice?.channel;
        if (!currentUserVoiceChannel) return;

        if (/stop/i.test(message.content)) {
            await this.cachingService.set(this.index.getKey(Keys.Enabled), false);
            this.voiceConnectionService.disconnect();
            return;
        }

        await this.cachingService.set(this.index.getKey(Keys.Enabled), true);
        await this.voiceConnectionService.getOrCreateConnection(currentUserVoiceChannel);
        this.voiceConnectionService.subscribeToDisconnect(() => {
            this.cachingService.set(this.index.getKey(Keys.Enabled), false);
        });
        this.playGwentMusicIndefinitely();
    }

    private async playGwentMusicIndefinitely(): Promise<void> {
        try {
            while (await this.cachingService.get(this.index.getKey(Keys.Enabled))) {
                const connection = this.voiceConnectionService.getConnection();
                let gwentSongs = await this.plexService.getGwentSongs();
                if (await this.cachingService.exists(this.index.getKey(Keys.LastPlayed))) {
                    const lastPlayed = await this.cachingService.get(this.index.getKey(Keys.LastPlayed));
                    gwentSongs = gwentSongs.filter(x => x !== lastPlayed);
                }
                const selectedSong = cryptoSelectRandom(gwentSongs);
                await this.cachingService.set(this.index.getKey(Keys.LastPlayed), selectedSong);
                const stream = connection.play(selectedSong, {
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
    static LastPlayed = "LastPlayed";
}
