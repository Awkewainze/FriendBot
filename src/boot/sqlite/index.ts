import { Database, ISqlite } from "sqlite";
import { DependencyContainer } from "tsyringe";
import { Lazy } from "../../utils";
import { CringeCashMigration } from "./cringeCash";
import { PermissionsMigration } from "./permissions";
import { UserTimeZoneMigration } from "./userTimeZones";
import RunResult = ISqlite.RunResult;

export interface Migration {
    run(db: Database): Promise<RunResult>;
}

export const runMigrations = async (container: DependencyContainer): Promise<void> => {
    const lazyDB = container.resolve<Lazy<Promise<Database>>>("Database");
    const db = await lazyDB.get();

    await new CringeCashMigration().run(db);
    await new PermissionsMigration().run(db);
    await new UserTimeZoneMigration().run(db);
};

export * from "./cringeCash";
export * from "./permissions";
export * from "./userTimeZones";
//
