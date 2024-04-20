import { Message } from "discord.js";
import { inject, Lifecycle, scoped } from "tsyringe";
import { GuildScopedVoiceConnectionService } from "../../services";
import { SoundInfo } from "../../services/soundPlayer/soundQueue";
import { Permission } from "../../utils";
import { Command } from "../command";

/**
 * Play some local sounds, can be used for testing or just some fun.
 * @category Command
 */
@scoped(Lifecycle.ResolutionScoped, "Command")
export class PlayLocalSoundCommand extends Command {
    constructor(
        @inject(GuildScopedVoiceConnectionService)
        private readonly voiceConnectionService: GuildScopedVoiceConnectionService
    ) {
        super();
    }

    requiredPermissions(): Set<Permission> {
        return new Set([Permission.UseCommands, Permission.PlaySound]);
    }

    /** Triggered by `$devplay <soundfile>`. */
    async check(message: Message): Promise<boolean> {
        return /^\$devplay\s+.*/i.test(message.content.trim());
    }

    async execute(message: Message): Promise<void> {
        const currentUserVoiceChannel = message?.member?.voice?.channel;
        if (!currentUserVoiceChannel) return;

        const { audioFileToPlay } = /^\$devplay\s+(?<audioFileToPlay>.*)/i.exec(message.content.trim()).groups;
        const connection = await this.voiceConnectionService.getOrCreateConnection(currentUserVoiceChannel);
        connection.playNow(new SoundInfo("[DEV]", "local", audioFileToPlay));
    }
}
