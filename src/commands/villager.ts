import { Message } from "discord.js";
import * as path from "path";
import { inject, injectable } from "tsyringe";
import { CachingService, GuildScopedIndex, GuildScopedVoiceConnectionService, Index } from "../services";
import { Duration, getMediaDir, getRandomFileFromDir, Timer } from "../utils";
import { Command } from "./command";

/**
 * Play villager noises indefinitely.
 * @category Command
 */
@injectable()
export class VillagerCommand extends Command {
    private static readonly VillagerDir = path.join(getMediaDir(), "sounds", "mcsounds", "villager-no-death-sounds");

    constructor(
        @inject(GuildScopedVoiceConnectionService)
        private readonly voiceConnectionService: GuildScopedVoiceConnectionService,
        @inject("CachingService") private readonly cachingService: CachingService,
        @inject(GuildScopedIndex) private readonly index: Index
    ) {
        super();
        this.index = index.addScope("VillagerCommand");
    }

    /** Triggered by `$villager (start|stop)` */
    async check(message: Message): Promise<boolean> {
        return /^\$villager (start|stop)$/i.test(message.content.trim());
    }

    /** Starts or stops villager noises in current voice channel. */
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
        this.playVillagerNoisesIndefinitely();
    }

    private async playVillagerNoisesIndefinitely(): Promise<void> {
        try {
            while (await this.cachingService.get(this.index.getKey(Keys.Enabled))) {
                const connection = this.voiceConnectionService.getConnection();
                const stream = connection.play(await getRandomFileFromDir(VillagerCommand.VillagerDir), {
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
