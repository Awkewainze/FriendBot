import { Message } from "discord.js";
import * as path from "path";
import { VoiceConnectionService } from "../services";
import { getMediaDir, getRandomFileFromDir } from "../utils";
import { Command } from "./command";

/**
 * Command to play "Ding"s from Destiny 2 when The Drifter starts a match of Gambit.
 *
 * [This](https://www.youtube.com/watch?v=dbKwMq8OoRs) but indefinitely and dings are randomized.
 * @category Command
 */
export class DingCommand extends Command {
    private static readonly DingFolder = path.join(getMediaDir(), "sounds", "dings");
    private static guildDingStatusEnabled: { [id: string]: boolean } = {};

    /** Triggered by `ding (start|stop)` */
    check(message: Message): boolean {
        return /^\$ding (start|stop)$/i.test(message.content.trim());
    }

    /** Start or stop dings in current voice channel. */
    async execute(message: Message): Promise<void> {
        const currentUserVoiceChannel = message?.member?.voice?.channel;
        if (!currentUserVoiceChannel) return;

        if (/stop/i.test(message.content)) {
            DingCommand.guildDingStatusEnabled[message.guild.id] = false;
            return;
        }

        DingCommand.guildDingStatusEnabled[message.guild.id] = false;
        await VoiceConnectionService.getVoiceConnectionService().getOrCreateConnectionForGuild(
            message.guild.id,
            currentUserVoiceChannel
        );
        this.playDingForever(message.guild.id);
    }

    private async playDingForever(guildId: string): Promise<void> {
        try {
            const connection = VoiceConnectionService.getVoiceConnectionService().getConnectionForGuild(guildId);
            const stream = connection.play(await getRandomFileFromDir(DingCommand.DingFolder), {
                volume: 0.4
            });
            stream.once("finish", () => {
                setTimeout(() => {
                    if (!DingCommand.guildDingStatusEnabled[guildId]) return;
                    this.playDingForever(guildId);
                }, 250);
            });
        } catch (err) {
            // connection not found, stop repeating.
            DingCommand.guildDingStatusEnabled[guildId] = false;
        }
    }
}
