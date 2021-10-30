import { Database, ISqlite } from "sqlite";
import { Migration } from "./index";
import RunResult = ISqlite.RunResult;

export class PermissionsMigration implements Migration {
    run(db: Database): Promise<RunResult> {
        return db.run(`
            CREATE TABLE IF NOT EXISTS permissions (
                guildId TEXT NOT NULL,
                discordId TEXT NOT NULL,
                permission TEXT NOT NULL,
                PRIMARY KEY (guildId, discordId, permission)
            )
        `);
    }
}
