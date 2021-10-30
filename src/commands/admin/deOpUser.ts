import { Message } from "discord.js";
import { inject, Lifecycle, scoped } from "tsyringe";
import { PermissionService } from "../../services";
import { DefaultPermissions, Permission } from "../../utils";
import { Command } from "../command";

/**
 * Make a user a FriendBot admin.
 * @category Command
 */
@scoped(Lifecycle.ResolutionScoped, "Command")
export class DeOpUserCommand extends Command {
    constructor(@inject(PermissionService) private readonly permissionService: PermissionService) {
        super();
    }

    requiredPermissions(): Set<Permission> {
        return new Set([Permission.UseCommands, Permission.ModifyPermissions]);
    }

    /** Triggered by `$deop <mention>`. */
    async check(message: Message): Promise<boolean> {
        return /^\$deop (.+)$/i.test(message.content.trim()) && message.mentions.members.size === 1;
    }

    async execute(message: Message): Promise<void> {
        const mention = message.mentions.members.first();
        await this.permissionService.setUserPermissions(message.guild.id, mention.id, DefaultPermissions);
        message.reply(`User ${mention.displayName} is no longer a FriendBot admin :(`);
    }
}
