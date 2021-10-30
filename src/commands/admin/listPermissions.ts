import { Message } from "discord.js";
import { inject, Lifecycle, scoped } from "tsyringe";
import { PermissionService } from "../../services";
import { Permission } from "../../utils";
import { Command } from "../command";

/**
 * List the permissions someone has.
 * @category Command
 */
@scoped(Lifecycle.ResolutionScoped, "Command")
export class ListPermissionsCommand extends Command {
    constructor(
        @inject(PermissionService)
        private readonly permissionService: PermissionService
    ) {
        super();
    }

    requiredPermissions(): Set<Permission> {
        return new Set([Permission.UseCommands, Permission.ModifyPermissions]);
    }

    /** Triggered by `$permission-list <mention>`. */
    async check(message: Message): Promise<boolean> {
        return /^\$permission-list (.+)$/i.test(message.content.trim()) && message.mentions.members.size === 1;
    }

    async execute(message: Message): Promise<void> {
        const perms = await this.permissionService.getUserPermissions(
            message.guild.id,
            message.mentions.members.first().id
        );
        await message.reply(
            Array.from(perms)
                .map(x => `\`${x}\``)
                .join(", ")
        );
    }
}
