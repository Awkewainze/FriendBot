import { runMigrations } from "./sqlite";
import { DependencyContainer } from "tsyringe";

export const boot = async (container: DependencyContainer): Promise<void> => {
    await runMigrations(container);
};
