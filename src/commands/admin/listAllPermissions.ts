import { Message } from "discord.js";
import { Lifecycle, scoped } from "tsyringe";
import { AllPermissions, Permission } from "../../utils";
import { Command } from "../command";

/**
 * Lists all permissions.
 * @category Command
 */
@scoped(Lifecycle.ResolutionScoped, "Command")
export class ListAllPermissionsCommand extends Command {
    constructor() {
        super();
    }

    requiredPermissions(): Set<Permission> {
        return new Set([Permission.UseCommands]);
    }

    /** Triggered by `$permission-list-all`. */
    async check(message: Message): Promise<boolean> {
        return /^\$permission-list-all$/i.test(message.content.trim());
    }

    async execute(message: Message): Promise<void> {
        await message.reply(
            Array.from(AllPermissions)
                .map(x => `\`${x}\``)
                .join(", ")
        );
    }
}
