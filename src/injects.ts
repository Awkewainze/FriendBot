import { container } from "tsyringe";
import {
    DebugCommand,
    DingCommand,
    DisconnectCommand,
    GoldWatchCommand,
    InspectCommand,
    MultipartExampleCommand,
    SusCommand,
    VillagerCommand
} from "./commands";
import { FakePersistentCachingService, InMemoryCachingService } from "./services";

// Services
container.register("CachingService", { useValue: new InMemoryCachingService() });
container.register("PersistentCachingService", { useValue: new FakePersistentCachingService() });

// Active Commands
container.register("Command", { useClass: DingCommand });
container.register("Command", { useClass: DisconnectCommand });
container.register("Command", { useClass: GoldWatchCommand });
container.register("Command", { useClass: InspectCommand });
container.register("Command", { useClass: SusCommand });
container.register("Command", { useClass: VillagerCommand });
container.register("Command", { useClass: MultipartExampleCommand });

// Disabled Commands
container.register("xCommand", { useClass: DebugCommand });
