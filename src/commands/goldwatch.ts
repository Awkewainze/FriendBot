import { Message } from "discord.js";
import * as path from "path";
import { inject, injectable } from "tsyringe";
import { GuildScopedVoiceConnectionService } from "../services";
import { getMediaDir } from "../utils";
import { Command } from "./command";

/**
 * Plays [Christopher Walken's Pulp Fiction Speech](https://www.youtube.com/watch?v=kWp6hZ-5ndc).
 * @category Command
 */
@injectable()
export class GoldWatchCommand extends Command {
    constructor(
        @inject(GuildScopedVoiceConnectionService)
        private readonly voiceConnectionService: GuildScopedVoiceConnectionService
    ) {
        super();
    }

    /** Triggered by `$goldwatch`. */
    check(message: Message): boolean {
        return /^\$goldwatch$/i.test(message.content.trim());
    }

    /** Plays gold watch speech in voice channel of the user is in. */
    async execute(message: Message): Promise<void> {
        const currentUserVoiceChannel = message?.member?.voice?.channel;
        if (!currentUserVoiceChannel) return;

        const audioFileToPlay = path.join(getMediaDir(), "sounds", "misc", "goldwatch.mp3");
        const connection = await this.voiceConnectionService.getOrCreateConnection(currentUserVoiceChannel);
        connection.play(audioFileToPlay, {
            volume: 0.6
        });
    }
}
