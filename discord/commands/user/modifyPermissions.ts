import { PermissionName } from "@prisma/client";
import type { ContextMenuCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { Lifecycle, scoped } from "tsyringe";
import { UserCommand } from "../command";

@scoped(Lifecycle.ResolutionScoped, "UserCommand")
export class ModifyPermissionsCommand extends UserCommand {
	get data(): ContextMenuCommandBuilder {
		throw new Error("Method not implemented.");
	}
	get name(): string {
		return "modify_user_permissions";
	}
	override requiredPermissions: ReadonlySet<PermissionName> = new Set<PermissionName>([
		PermissionName.UseCommands,
		PermissionName.ModifyPermissions
	]);
	execute(interaction: UserContextMenuCommandInteraction): Promise<void> {
		throw new Error("Method not implemented.");
	}
}
