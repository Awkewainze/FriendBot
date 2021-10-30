import { Message } from "discord.js";
import { inject, Lifecycle, scoped } from "tsyringe";
import { GuildScopedVoiceConnectionService } from "../../services";
import { Permission } from "../../utils";
import { Command } from "../command";

/**
 * Command to manage disconnecting from server.
 *
 * Triggered by message of contents `$disconnect`
 * @category Command
 */
@scoped(Lifecycle.ResolutionScoped, "Command")
export class DisconnectCommand extends Command {
    constructor(
        @inject(GuildScopedVoiceConnectionService)
        private readonly voiceConnectionService: GuildScopedVoiceConnectionService
    ) {
        super();
    }

    requiredPermissions(): Set<Permission> {
        return new Set([Permission.UseCommands, Permission.PlaySound]);
    }

    /** Triggered by `$disconnect`. */
    async check(message: Message): Promise<boolean> {
        return /^\$(disconnect|dc)$/i.test(message.content.trim());
    }

    /** Disconnect from server message was sent in. */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(_: Message): Promise<void> {
        this.voiceConnectionService.disconnect();
    }

    /** @inheritdoc */
    priority(): number {
        return 100;
    }
}
