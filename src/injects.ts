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
container.register("Command", { useClass: ReactToPetsCommand });

// Disabled Commands
container.register("xCommand", { useClass: DebugCommand });
container.register("xCommand", { useClass: MultipartExampleCommand });
container.register("xCommand", { useClass: SimpleMultipartExampleCommand });
