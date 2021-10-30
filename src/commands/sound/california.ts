import { Message } from "discord.js";
import * as path from "path";
import { inject, Lifecycle, scoped } from "tsyringe";
import { GuildScopedVoiceConnectionService } from "../../services";
import { getMediaDir, Permission } from "../../utils";
import { Command } from "../command";

/**
 * Namaste
 * @category Command
 */
@scoped(Lifecycle.ResolutionScoped, "Command")
export class CaliforniaCommand extends Command {
    constructor(
        @inject(GuildScopedVoiceConnectionService)
        private readonly voiceConnectionService: GuildScopedVoiceConnectionService
    ) {
        super();
    }

    requiredPermissions(): Set<Permission> {
        return new Set([Permission.UseCommands, Permission.PlaySound]);
    }

    /** Triggered by `$california`. */
    async check(message: Message): Promise<boolean> {
        return /^\$california$/i.test(message.content.trim());
    }

    async execute(message: Message): Promise<void> {
        const currentUserVoiceChannel = message?.member?.voice?.channel;
        if (!currentUserVoiceChannel) return;

        const audioFileToPlay = path.join(getMediaDir(), "sounds", "misc", "california.mp3");
        const connection = await this.voiceConnectionService.getOrCreateConnection(currentUserVoiceChannel);
        connection.play(audioFileToPlay, {
            volume: 0.6
        });
    }
}
