import { Message } from "discord.js";
import { inject, Lifecycle, scoped } from "tsyringe";
import { PermissionService } from "../../services";
import { AllPermissions, Permission } from "../../utils";
import { Command } from "../command";

/**
 * Remove a permission from a user.
 * @category Command
 */
@scoped(Lifecycle.ResolutionScoped, "Command")
export class RemovePermissionCommand extends Command {
    constructor(@inject(PermissionService) private readonly permissionService: PermissionService) {
        super();
    }

    requiredPermissions(): Set<Permission> {
        return new Set([Permission.UseCommands, Permission.ModifyPermissions]);
    }

    /** Triggered by `$permission-remove <mention> <permission>`. */
    async check(message: Message): Promise<boolean> {
        return /^\$permission-remove (.+) (.+)$/i.test(message.content.trim()) && message.mentions.members.size === 1;
    }

    async execute(message: Message): Promise<void> {
        const mention = message.mentions.members.first();
        const permission = /^\$permission-remove (.+) (?<permission>.+)$/i.exec(message.content).groups.permission;
        const foundPermission = Array.from(AllPermissions).find(x => x.toLowerCase() === permission.toLowerCase());
        if (foundPermission) {
            await this.permissionService.removeUserPermissions(
                message.guild.id,
                mention.id,
                new Set([foundPermission])
            );
            await message.reply(`Permission \`${foundPermission}\` removed from ${mention.displayName}`);
        } else {
            await message.reply(
                `Could not find permission \`${permission}\`, use \`$list-permissions\` to see all permissions.`
            );
        }
    }
}
