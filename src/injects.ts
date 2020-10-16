import { container } from "tsyringe";
import {
    DebugCommand,
    DingCommand,
    DisconnectCommand,
    GoldWatchCommand,
    InspectCommand,
    SusCommand,
    VillagerCommand
} from "./commands";
import { InMemoryCachingService } from "./services";

// Services
container.register("CachingService", { useValue: new InMemoryCachingService() });

// Active Commands
container.register("Command", { useClass: DingCommand });
container.register("Command", { useClass: DisconnectCommand });
container.register("Command", { useClass: GoldWatchCommand });
container.register("Command", { useClass: InspectCommand });
container.register("Command", { useClass: SusCommand });
container.register("Command", { useClass: VillagerCommand });

// Disabled Commands
container.register("xCommand", { useClass: DebugCommand });
