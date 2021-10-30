import { Message } from "discord.js";
import { inject, Lifecycle, scoped } from "tsyringe";
import { GuildMemberScopedPermissionService } from "../../services";
import { Permission } from "../../utils";
import { Command } from "../command";

/**
 * List the permissions on yourself.
 * @category Command
 */
@scoped(Lifecycle.ResolutionScoped, "Command")
export class ListMyPermissionsCommand extends Command {
    constructor(
        @inject(GuildMemberScopedPermissionService)
        private readonly permissionService: GuildMemberScopedPermissionService
    ) {
        super();
    }

    requiredPermissions(): Set<Permission> {
        return new Set([Permission.UseCommands]);
    }

    /** Triggered by `$permission-list-me`. */
    async check(message: Message): Promise<boolean> {
        return /^\$permission-list-me$/i.test(message.content.trim());
    }

    async execute(message: Message): Promise<void> {
        const myPerms = await this.permissionService.getMyPermissions();
        await message.reply(
            Array.from(myPerms)
                .map(x => `\`${x}\``)
                .join(", ")
        );
    }
}
