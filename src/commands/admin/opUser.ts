import { Message } from "discord.js";
import { inject, Lifecycle, scoped } from "tsyringe";
import { PermissionService } from "../../services";
import { AllPermissions, Permission } from "../../utils";
import { Command } from "../command";

/**
 * Make a user a FriendBot admin.
 * @category Command
 */
@scoped(Lifecycle.ResolutionScoped, "Command")
export class OpUserCommand extends Command {
    constructor(@inject(PermissionService) private readonly permissionService: PermissionService) {
        super();
    }

    requiredPermissions(): Set<Permission> {
        return new Set([Permission.UseCommands, Permission.ModifyPermissions]);
    }

    /** Triggered by `$op <mention>`. */
    async check(message: Message): Promise<boolean> {
        return /^\$op (.+)$/i.test(message.content.trim()) && message.mentions.members.size === 1;
    }

    async execute(message: Message): Promise<void> {
        const mention = message.mentions.members.first();
        await this.permissionService.addUserPermissions(message.guild.id, mention.id, AllPermissions);
        await message.reply(`User ${mention.displayName} has been made a FriendBot admin :)`);
    }
}
