import { DatabaseService } from "../../src/services";
import { TestLogger } from "../testLogger";
import { Database, open } from "sqlite";
import { Lazy } from "../../src/utils";
import * as sqlite3 from "sqlite3";

export default class MockDatabaseService extends DatabaseService {
    constructor() {
        super(
            new Lazy<Promise<Database>>(() =>
                open({
                    filename: ":memory:",
                    driver: sqlite3.Database
                })
            ),
            TestLogger
        );
    }
}
