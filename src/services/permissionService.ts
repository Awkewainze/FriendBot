import { inject, Lifecycle, scoped, singleton } from "tsyringe";
import winston from "winston";
import { DatabaseService } from ".";
import { AllPermissions, DefaultPermissions, Permission } from "../utils/permissions";

type PermissionRow = {
    guildId: string;
    discordId: string;
    permission: Permission;
};

/**
 * Manages permissions
 * @category Service
 */
@singleton()
export class PermissionService {
    constructor(
        @inject("Logger") private readonly logger: winston.Logger,
        @inject(DatabaseService) private readonly databaseService: DatabaseService
    ) {
        this.logger = this.logger.child({ src: "PermissionService" });
    }

    public async getUserPermissions(guildId: string, userId: string): Promise<Set<Permission>> {
        const results = await this.databaseService.query<PermissionRow>(
            "SELECT * FROM permissions WHERE guildId=? AND discordId=?",
            guildId,
            userId
        );
        if (results.length === 0) {
            await this.addUserPermissions(guildId, userId, new Set(DefaultPermissions));
            return new Set(DefaultPermissions);
        }
        return new Set(results.map(row => row.permission));
    }

    public async setUserPermissions(
        guildId: string,
        userId: string,
        permissions: ReadonlySet<Permission>
    ): Promise<void> {
        await this.removeUserPermissions(guildId, userId, AllPermissions);
        await this.addUserPermissions(guildId, userId, permissions);
    }

    public async addUserPermissions(
        guildId: string,
        userId: string,
        permissions: ReadonlySet<Permission>
    ): Promise<void> {
        const db = await this.databaseService.getDatabase();
        const stmt = await db.prepare(
            "INSERT OR IGNORE INTO permissions(guildId, discordId, permission) VALUES (?, ?, ?)"
        );
        Array.from(permissions).forEach(permission => {
            stmt.run(guildId, userId, permission);
        });
        await stmt.finalize();
        if (permissions.size > 0 && (!permissions.has(Permission.None) || permissions.size > 1)) {
            await db.run(
                "DELETE FROM permissions WHERE guildId=? AND discordId=? AND permission=?",
                guildId,
                userId,
                Permission.None
            );
        }
    }

    public async removeUserPermissions(
        guildId: string,
        userId: string,
        permissions: ReadonlySet<Permission>
    ): Promise<void> {
        const db = await this.databaseService.getDatabase();
        await db.run(
            "DELETE FROM permissions WHERE guildId=? AND discordId=? AND permission IN (?)",
            guildId,
            userId,
            Array.from(permissions)
        );
        // Check to see if there are no permissions left
        const results = await this.databaseService.query<PermissionRow>(
            "SELECT * FROM permissions WHERE guildId=? AND discordId=?",
            guildId,
            userId
        );
        if (results.length === 0) {
            await this.addUserPermissions(guildId, userId, new Set([Permission.None]));
        }
    }
}

@scoped(Lifecycle.ResolutionScoped)
export class GuildMemberScopedPermissionService {
    constructor(
        @inject(PermissionService) private readonly permissionService: PermissionService,
        @inject("GuildId") private readonly guildId: string,
        @inject("GuildMemberId") private readonly userId: string
    ) {}

    public getMyPermissions(): Promise<Set<Permission>> {
        return this.permissionService.getUserPermissions(this.guildId, this.userId);
    }
}
