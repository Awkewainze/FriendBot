import { Message } from "discord.js";
import * as path from "path";
import { VoiceConnectionService } from "../services";
import { getMediaDir, getRandomFileFromDir } from "../utils";
import { Command } from "./command";

/**
 * Play villager noises indefinitely.
 * @category Command
 */
export class VillagerCommand extends Command {
    private static readonly VillagerDir = path.join(getMediaDir(), "sounds", "mcsounds", "villager-no-death-sounds");
    private static guildVillagerStatusEnabled: { [id: string]: boolean } = {};

    /** Triggered by `$villager (start|stop)` */
    check(message: Message): boolean {
        return /^\$villager (start|stop)$/i.test(message.content.trim());
    }

    /** Starts or stops villager noises in current voice channel. */
    async execute(message: Message): Promise<void> {
        const currentUserVoiceChannel = message?.member?.voice?.channel;
        if (!currentUserVoiceChannel) return;

        if (/stop/i.test(message.content)) {
            VillagerCommand.guildVillagerStatusEnabled[message.guild.id] = false;
            return;
        }

        VillagerCommand.guildVillagerStatusEnabled[message.guild.id] = true;
        await VoiceConnectionService.getVoiceConnectionService().getOrCreateConnectionForGuild(
            message.guild.id,
            currentUserVoiceChannel
        );
        VoiceConnectionService.getVoiceConnectionService().subscribeToDisconnect(message.guild.id, () => {
            VillagerCommand.guildVillagerStatusEnabled[message.guild.id] = false;
        });
        this.playRandomVillagerSoundsForever(message.guild.id);
    }

    private async playRandomVillagerSoundsForever(guildId: string): Promise<void> {
        try {
            const connection = VoiceConnectionService.getVoiceConnectionService().getConnectionForGuild(guildId);
            const stream = connection.play(await getRandomFileFromDir(VillagerCommand.VillagerDir), {
                volume: 0.4
            });
            stream.once("finish", () => {
                setTimeout(() => {
                    if (!VillagerCommand.guildVillagerStatusEnabled[guildId]) return;
                    this.playRandomVillagerSoundsForever(guildId);
                }, 1000 + Math.random() * 1000 * 3);
            });
        } catch (err) {
            // connection not found, stop repeating.
            VillagerCommand.guildVillagerStatusEnabled[guildId] = false;
        }
    }
}
