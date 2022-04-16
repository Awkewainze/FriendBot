import { Message } from "discord.js";
import * as path from "path";
import { inject, Lifecycle, scoped } from "tsyringe";
import { GuildScopedVoiceConnectionService } from "../../services";
import { getMediaDir, Permission } from "../../utils";
import { Command } from "../command";

/**
 * Mommy https://www.youtube.com/watch?v=wnZcdH0Vlow
 * @category Command
 */
@scoped(Lifecycle.ResolutionScoped, "Command")
export class MommyCommand extends Command {
    constructor(
        @inject(GuildScopedVoiceConnectionService)
        private readonly voiceConnectionService: GuildScopedVoiceConnectionService
    ) {
        super();
    }

    requiredPermissions(): Set<Permission> {
        return new Set([Permission.UseCommands, Permission.PlaySound]);
    }

    /** Triggered by `$mommy`. */
    async check(message: Message): Promise<boolean> {
        return /^\$mommy$/i.test(message.content.trim());
    }

    async execute(message: Message): Promise<void> {
        const currentUserVoiceChannel = message?.member?.voice?.channel;
        if (!currentUserVoiceChannel) return;

        const audioFileToPlay = path.join(getMediaDir(), "sounds", "misc", "mommy.mp3");
        const connection = await this.voiceConnectionService.getOrCreateConnection(currentUserVoiceChannel);
        connection.play(audioFileToPlay, {
            volume: 0.6
        });
    }
}
