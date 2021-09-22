import { Database, verbose } from "sqlite3";
import { singleton } from "tsyringe";
import { Lazy } from "../utils";

@singleton()
export class DatabaseService {
    private readonly MainDB: Lazy<Database> = new Lazy<Database>(() => {
        const sqlite = verbose();
        return new sqlite.Database("main");
    });

    getDatabase(): Database {
        return this.MainDB.get();
    }

    query<T>(query: string): Promise<Array<T>> {
        return new Promise((resolve, reject) => {
            this.MainDB.get().all(query, (err: Error, rows: Array<T>) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(rows);
            });
        });
    }

    foreach<T>(query: string, consumer: Consumer<T>): Promise<number> {
        return new Promise((resolve, reject) => {
            this.MainDB.get().each(
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
}
