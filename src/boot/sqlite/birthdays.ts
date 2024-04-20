import { Database, ISqlite } from "sqlite";
import { Migration } from "./index";
import RunResult = ISqlite.RunResult;

export class BirthdaysMigration implements Migration {
    run(db: Database): Promise<RunResult> {
        return db.run(`
            CREATE TABLE IF NOT EXISTS birthdays (
                discordId TEXT NOT NULL,
                birthday TEXT NOT NULL,
                PRIMARY KEY (discordId)
            )
        `);
    }
}
