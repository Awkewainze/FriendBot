import { Database, ISqlite } from "sqlite";
import { inject, singleton } from "tsyringe";
import { Lazy } from "../utils";
import winston from "winston";
import RunResult = ISqlite.RunResult;

@singleton()
export class DatabaseService {
    constructor(
        @inject("Database") private readonly MainDB: Lazy<Promise<Database>>,
        @inject("Logger") private readonly logger: winston.Logger
    ) {
        this.logger = this.logger.child({ src: "DatabaseService" });
    }

    getDatabase(): Promise<Database> {
        return this.MainDB.get();
    }

    query<T>(query: string, ...params: Array<string>): Promise<Array<T>> {
        // const db = await this.getDatabase();
        return this.getDatabase().then(db => db.all(query, ...params));
    }

    get<T>(query: string, ...params: Array<string>): Promise<T> {
        return this.getDatabase().then(db => db.get<T>(query, ...params));
    }

    async foreach<T>(query: string, consumer: Consumer<T>): Promise<number> {
        const db = await this.getDatabase();

        return new Promise((resolve, reject) => {
            db.each(
                query,
                (err: Error, row: T) => {
                    if (err) return;
                    consumer(row);
                },
                (err: Error, count: number) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(count);
                }
            );
        });
    }

    async insert(query: string, ...params: Array<string>): Promise<RunResult> {
        const db = await this.getDatabase();

        const stmt = await db.prepare(query);
        return await stmt.run(params);
    }
}
