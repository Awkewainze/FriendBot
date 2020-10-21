import { createClient } from "redis";
import { container } from "tsyringe";
import {
    DebugCommand,
    DingCommand,
    DisconnectCommand,
    GoldWatchCommand,
    InspectCommand,
    MultipartExampleCommand,
    ReactToPetsCommand,
    SimpleMultipartExampleCommand,
    SusCommand,
    VillagerCommand
} from "./commands";
import { CONFIG } from "./config";
import {
    FakePersistentCachingService,
    InMemoryCachingService,
    PersistentCachingService,
    RedisCachingService
} from "./services";
import { Lazy, memoize } from "./utils";

// Services
container.register("CachingService", { useValue: new InMemoryCachingService() });

let connected = false;
const client = createClient(CONFIG.REDIS);
client.on("connect", () => (connected = true));
client.on("error", () => (connected = false));
client.on("end", () => (connected = false));
const logWarningOnce: () => void = memoize(() =>
    console.warn("Failed to create Redis client, falling back to fake caching service")
);

const cachingService = new Lazy<PersistentCachingService>(() => {
    if (connected) {
        return new RedisCachingService(client);
    }
    logWarningOnce();
    return new FakePersistentCachingService();
});

container.register<PersistentCachingService>("PersistentCachingService", {
    useFactory: _ => cachingService.get()
});

// Active Commands
container.register("Command", { useClass: DingCommand });
container.register("Command", { useClass: DisconnectCommand });
container.register("Command", { useClass: GoldWatchCommand });
container.register("Command", { useClass: InspectCommand });
container.register("Command", { useClass: SusCommand });
container.register("Command", { useClass: VillagerCommand });
container.register("Command", { useClass: ReactToPetsCommand });

// Disabled Commands
container.register("xCommand", { useClass: DebugCommand });
container.register("xCommand", { useClass: MultipartExampleCommand });
container.register("Command", { useClass: SimpleMultipartExampleCommand });
