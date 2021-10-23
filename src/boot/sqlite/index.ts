import { Database, ISqlite } from "sqlite";
import RunResult = ISqlite.RunResult;
import { DependencyContainer } from "tsyringe";
import { Lazy } from "../../utils";
import { CringeCashMigration } from "./cringeCash";

export interface Migration {
    run(db: Database): Promise<RunResult>;
}

export const runMigrations = async (container: DependencyContainer): Promise<void> => {
    const lazyDB = container.resolve<Lazy<Promise<Database>>>("Database");
    const db = await lazyDB.get();

    await new CringeCashMigration().run(db);
};

export * from "./cringeCash";
