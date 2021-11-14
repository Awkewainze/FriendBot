import { Database, ISqlite } from "sqlite";
import { Migration } from "./index";
import RunResult = ISqlite.RunResult;

export class UserTimeZoneMigration implements Migration {
    run(db: Database): Promise<RunResult> {
        return db.run(`
            CREATE TABLE IF NOT EXISTS userTimeZones (
                discordId TEXT NOT NULL,
                timeZone TEXT NOT NULL,
                PRIMARY KEY (discordId)
            )
        `);
    }
}
