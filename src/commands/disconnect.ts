import { Message } from "discord.js";
import { inject, injectable } from "tsyringe";
import { GuildScopedVoiceConnectionService } from "../services";
import { Command } from "./command";

/**
 * Command to manage disconnecting from server.
 *
 * Triggered by message of contents `$disconnect`
 * @category Command
 */
@injectable()
export class DisconnectCommand extends Command {
    constructor(
        @inject(GuildScopedVoiceConnectionService)
        private readonly voiceConnectionService: GuildScopedVoiceConnectionService
    ) {
        super();
    }

    /** Triggered by `$disconnect`. */
    async check(message: Message): Promise<boolean> {
        return /^\$disconnect$/i.test(message.content.trim());
    }

    /** Disconnect from server message was sent in. */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(message: Message): Promise<void> {
        this.voiceConnectionService.disconnect();
    }

    /** @inheritdoc */
    priority(): number {
        return 100;
    }
}
