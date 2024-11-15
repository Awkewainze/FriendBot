import { PermissionName, PrismaClient } from "@prisma/client";
import { inject, Lifecycle, scoped } from "tsyringe";

const _defaultPermissions = new Set<PermissionName>([
	PermissionName.UseCommands,
	PermissionName.ModifySelf,
	PermissionName.ModifyOtherTemporary,
	PermissionName.PlaySound,
	PermissionName.CringeCash,
]);

@scoped(Lifecycle.ResolutionScoped)
export class PermissionService {
	constructor(@inject(PrismaClient) private readonly prismaClient: PrismaClient) { }

	async userHasPermissions(
		userId: string,
		guildId: string,
		permissions: PermissionName[],
	): Promise<boolean> {
		const existing = await this.prismaClient.permission.findMany({
			where: {
				userId,
				guildId,
				permission: {
					in: permissions,
				},
			},
		});

		return permissions.every((permission) => {
			const inDB = existing.find((value) => value.permission === permission);
			if (!inDB) {
				return _defaultPermissions.has(permission);
			}

			return inDB.grant;
		});
	}

	async grant(
		userId: string,
		guildId: string,
		permissions: PermissionName[],
	): Promise<void> {
		await Promise.all(
			permissions.map(async (permission) => {
				await this.prismaClient.permission.upsert({
					create: {
						grant: true,
						permission,
						userId,
						guildId,
					},
					update: {
						grant: true,
					},
					where: {
						id: undefined,
						AND: [
							{
								guildId,
							},
							{
								userId,
							},
							{
								permission,
							},
						],
					},
				});
			}),
		);
	}

	async revoke(
		userId: string,
		guildId: string,
		permissions: PermissionName[],
	): Promise<void> {
		await Promise.all(
			permissions.map(async (permission) => {
				await this.prismaClient.permission.upsert({
					create: {
						grant: false,
						permission,
						userId,
						guildId,
					},
					update: {
						grant: false,
					},
					where: {
						id: undefined,
						AND: [
							{
								guildId,
							},
							{
								userId,
							},
							{
								permission,
							},
						],
					},
				});
			}),
		);
	}
}
