import { Message } from "discord.js";
import * as path from "path";
import { inject, injectable } from "tsyringe";
import { GuildScopedVoiceConnectionService } from "../services";
import { getMediaDir } from "../utils";
import { Command } from "./command";

/**
 * We also saw this dog holding a banana.
 * @category Command
 */
@injectable()
export class BananaDogCommand extends Command {
    constructor(
        @inject(GuildScopedVoiceConnectionService)
        private readonly voiceConnectionService: GuildScopedVoiceConnectionService
    ) {
        super();
    }

    /** Triggered by `$banana`. */
    async check(message: Message): Promise<boolean> {
        return /^\$banana$/i.test(message.content.trim());
    }

    async execute(message: Message): Promise<void> {
        const currentUserVoiceChannel = message?.member?.voice?.channel;
        if (!currentUserVoiceChannel) return;

        const audioFileToPlay = path.join(getMediaDir(), "sounds", "misc", "banana-dog.mp3");
        const connection = await this.voiceConnectionService.getOrCreateConnection(currentUserVoiceChannel);
        connection.play(audioFileToPlay, {
            volume: 0.6
        });
    }
}
