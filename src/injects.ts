import { createClient } from "redis";
import { container } from "tsyringe";
import {
    BananaDogCommand,
    DebugCommand,
    DingCommand,
    DisconnectCommand,
    GoldWatchCommand,
    GwentCommand,
    InspectCommand,
    MultipartExampleCommand,
    OnHowdyCommand,
    ReactToPetsCommand,
    SimpleMultipartExampleCommand,
    SprayCommand,
    SusCommand,
    UserTrackingCommand,
    VillagerCommand
} from "./commands";
import { CONFIG } from "./config";
import { Logger } from "./logger";
import {
    FakePersistentCachingService,
    InMemoryCachingService,
    PersistentCachingService,
    RedisCachingService
} from "./services";
import { Lazy } from "./utils";
import * as sqlite3 from "sqlite3";
import { Database, open } from "sqlite";
import { DatabaseService } from "./services/databaseService";

container.register("Logger", { useValue: Logger });

// Services
container.registerInstance("CachingService", container.resolve(InMemoryCachingService));

let connected = false;
const client = createClient(CONFIG.REDIS);
client.on("connect", () => {
    connected = true;
    Logger.info("Redis connected");
});
client.on("error", (...args: Array<any>) => {
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
    useFactory: _ => cachingService.get()
});

container.register<Lazy<Promise<Database>>>("Database", {
    useFactory: () =>
        new Lazy<Promise<Database>>(() => {
            return open({
                filename: "database/sqlite",
                driver: sqlite3.Database
            }).catch(e => {
                // TODO better handle this error and ensure it logs correctly
                // eslint-disable-next-line no-console
                console.error(e);
                throw e;
            });
        })
});

container.register<DatabaseService>("DatabaseService", { useClass: DatabaseService });

// Active Commands
container.register("Command", { useClass: DingCommand });
container.register("Command", { useClass: DisconnectCommand });
container.register("Command", { useClass: GoldWatchCommand });
container.register("Command", { useClass: InspectCommand });
container.register("Command", { useClass: SusCommand });
container.register("Command", { useClass: VillagerCommand });
container.register("Command", { useClass: ReactToPetsCommand });
container.register("Command", { useClass: OnHowdyCommand });
container.register("Command", { useClass: BananaDogCommand });
container.register("Command", { useClass: UserTrackingCommand });
container.register("Command", { useClass: SprayCommand });
container.register("Command", { useClass: GwentCommand });

// Disabled Commands
container.register("xCommand", { useClass: DebugCommand });
container.register("xCommand", { useClass: MultipartExampleCommand });
container.register("xCommand", { useClass: SimpleMultipartExampleCommand });
