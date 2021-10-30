import { Message } from "discord.js";
import { inject, Lifecycle, scoped } from "tsyringe";
import { PermissionService } from "../../services";
import { AllPermissions, Permission } from "../../utils";
import { Command } from "../command";

/**
 * Give a user a permission.
 * @category Command
 */
@scoped(Lifecycle.ResolutionScoped, "Command")
export class AddPermissionCommand extends Command {
    constructor(@inject(PermissionService) private readonly permissionService: PermissionService) {
        super();
    }

    requiredPermissions(): Set<Permission> {
        return new Set([Permission.UseCommands, Permission.ModifyPermissions]);
    }

    /** Triggered by `$permission-add <mention> <permission>`. */
    async check(message: Message): Promise<boolean> {
        return /^\$permission-add (.+) (.+)$/i.test(message.content.trim()) && message.mentions.members.size === 1;
    }

    async execute(message: Message): Promise<void> {
        const mention = message.mentions.members.first();
        const permission = /^\$permission-add (.+) (?<permission>.+)$/i.exec(message.content).groups.permission;
        const foundPermission = Array.from(AllPermissions).find(x => x.toLowerCase() === permission.toLowerCase());
        if (foundPermission) {
            await this.permissionService.addUserPermissions(message.guild.id, mention.id, new Set([foundPermission]));
            await message.reply(`Permission \`${foundPermission}\` added to ${mention.displayName}`);
        } else {
            await message.reply(
                `Could not find permission \`${permission}\`, use \`$permission-list-all\` to see all permissions.`
            );
        }
    }
}
