import { inject, Lifecycle, scoped } from "tsyringe";
import { GuildScopedIndex, Index } from "./cachingService";

@scoped(Lifecycle.ResolutionScoped)
export class ChannelManagementService {
    constructor(@inject(GuildScopedIndex) private readonly guildIndex: Index) {
        this.guildIndex = this.guildIndex.addScope("ChannelManagementService");
    }
}
