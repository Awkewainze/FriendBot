import { Migration } from "./index";
import { Database, ISqlite } from "sqlite";
import RunResult = ISqlite.RunResult;

export class CringeCashMigration implements Migration {
    run(db: Database): Promise<RunResult> {
        return db.run(`
            CREATE TABLE IF NOT EXISTS cashBalance (
                discordId TEXT UNIQUE,
                balance INT
            )
        `);
    }
}
