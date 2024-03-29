import { Database, ISqlite } from "sqlite";
import { Migration } from "./index";
import RunResult = ISqlite.RunResult;

export class CringeCashMigration implements Migration {
    run(db: Database): Promise<RunResult> {
        return db.run(`
            CREATE TABLE IF NOT EXISTS cashBalance (
                guildId TEXT NOT NULL,
                discordId TEXT NOT NULL,
                balance INT NOT NULL,
                PRIMARY KEY (guildId, discordId)
            )
        `);
    }
}
