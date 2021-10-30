import { Message } from "discord.js";
import { Permission } from "../utils";

/**
 * Runnable based on if provided message is a trigger.
 * @category Command
 */
export abstract class Command {
    /**
     * Checks if this command should be run.
     * @param message Message to check if command should be executed.
     * @returns If this command should be executed.
     */
    abstract check(message: Message): Promise<boolean>;

    /**
     * Command to run if parsed message passes.
     * @param message Message to respond or react to.
     */
    abstract execute(message: Message): Promise<void>;

    /**
     * Get the permissions a user would need to run this command. Can check additional permissions in the check method, just initial check.
     * @returns Permissions needed to run this command.
     */
    requiredPermissions(): Set<Permission> {
        return new Set([Permission.UseCommands]);
    }

    /**
     * Where the command should be sorted relative to other commands.
     * @returns Priority of command, with higher number being higher priority.
     */
    priority(): number {
        return 0;
    }

    /**
     * If other commands should not be parsed/executed if this command is triggered.
     *
     * * Note: Does not stop higher priority commands.
     * @returns Whether or not this command is exclusive
     * (i.e. stops other commands from running, doesn't stop higher priority commands).
     */
    exclusive(): boolean {
        return true;
    }
}
