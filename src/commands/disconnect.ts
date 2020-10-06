import { Message } from "discord.js";
import { VoiceConnectionService } from "../services";
import { Command } from "./command";

/**
 * Command to manage disconnecting from server.
 *
 * Triggered by message of contents `$disconnect`
 * @category Command
 */
export class DisconnectCommand extends Command {
    /** Triggered by `$disconnect`. */
    check(message: Message): boolean {
        return /^\$disconnect$/i.test(message.content.trim());
    }

    /** Disconnect from server message was sent in. */
    async execute(message: Message): Promise<void> {
        VoiceConnectionService.getVoiceConnectionService().disconnect(message.guild.id);
    }

    /** @inheritdoc */
    priority(): number {
        return 100;
    }
}
