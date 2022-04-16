import { Message } from "discord.js";
import * as path from "path";
import { inject, Lifecycle, scoped } from "tsyringe";
import { GuildScopedVoiceConnectionService } from "../../services";
import { getMediaDir, getRandomFileFromDir, Permission } from "../../utils";
import { Command } from "../command";

/**
 * Plays a random Dehaka voice line.
 * @category Command
 */
@scoped(Lifecycle.ResolutionScoped, "Command")
export class DehakaCommand extends Command {
    private static readonly DehakaFolder = path.join(getMediaDir(), "sounds", "dehaka");
    constructor(
        @inject(GuildScopedVoiceConnectionService)
        private readonly voiceConnectionService: GuildScopedVoiceConnectionService
    ) {
        super();
    }

    requiredPermissions(): Set<Permission> {
        return new Set([Permission.UseCommands, Permission.PlaySound]);
    }

    /** Triggered by `essence` mentioned in a message and user is in a voice channel. */
    async check(message: Message): Promise<boolean> {
        return /essence/i.test(message.content) && !!message.member.voice;
    }

    async execute(message: Message): Promise<void> {
        const currentUserVoiceChannel = message?.member?.voice?.channel;
        if (!currentUserVoiceChannel) return;

        const audioFileToPlay = await getRandomFileFromDir(DehakaCommand.DehakaFolder);
        const connection = await this.voiceConnectionService.getOrCreateConnection(currentUserVoiceChannel);
        connection.play(audioFileToPlay, {
            volume: 0.6
        });
    }
}
