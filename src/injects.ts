import { createClient } from "redis";
import { Database, open } from "sqlite";
import * as sqlite3 from "sqlite3";
import { container } from "tsyringe";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as Commands from "./commands";
import { CONFIG } from "./config";
import { Logger } from "./logger";
import {
    FakePersistentCachingService,
    InMemoryCachingService,
    PersistentCachingService,
    RedisCachingService
} from "./services";
import { Lazy } from "./utils";

container.register("Logger", { useValue: Logger });

// Services
container.registerInstance("CachingService", container.resolve(InMemoryCachingService));

let connected = false;
const client = createClient(CONFIG.REDIS);
client.on("connect", () => {
    connected = true;
    Logger.info("Redis connected");
});
client.on("error", (...args: Array<unknown>) => {
    connected = false;
    Logger.error(args);
});
client.on("end", () => (connected = false));

container.register("RedisClient", { useValue: client });

const cachingService = new Lazy<PersistentCachingService>(() => {
    if (connected) {
        return container.resolve(RedisCachingService);
    }

    Logger.warn("Failed to create Redis client, falling back to fake caching service");
    return container.resolve(FakePersistentCachingService);
});

container.register<PersistentCachingService>("PersistentCachingService", {
    useFactory: () => cachingService.get()
});

container.register<Lazy<Promise<Database>>>("Database", {
    useFactory: () =>
        new Lazy<Promise<Database>>(() => {
            return open({
                filename: "database/sqlite",
                driver: sqlite3.Database
            });
        })
});

Commands;
