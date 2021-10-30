import { CachingService, Index, PersistentCachingService } from "../../services";
import { Command } from "../command";

export abstract class StatefulCommand<State, PersistentState extends JsonSerializable> extends Command {
    constructor(
        private readonly cachingService: CachingService,
        private readonly persistentCachingService: PersistentCachingService,
        private readonly defaultState: State,
        private readonly defaultPersistentState: PersistentState
    ) {
        super();
    }
    async getState(index: Index): Promise<State> {
        return await this.cachingService.getOrAdd(index.getKey(Keys.State), this.defaultState);
    }
    async setState(index: Index, newStateChanges: Partial<State>): Promise<void> {
        const currentState = await this.cachingService.getOrAdd<State>(index.getKey(Keys.State), this.defaultState);
        const newState = Object.assign(currentState, newStateChanges);
        await this.cachingService.set(index.getKey(Keys.State), newState);
    }

    async getPersistentState(index: Index): Promise<PersistentState> {
        return await this.persistentCachingService.getOrAdd<PersistentState>(
            index.getKey(Keys.State),
            this.defaultPersistentState
        );
    }
    async setPersistentState(index: Index, newStateChanges: Partial<PersistentState>): Promise<void> {
        const currentState = await this.persistentCachingService.getOrAdd<PersistentState>(
            index.getKey(Keys.State),
            this.defaultPersistentState
        );
        const newState = Object.assign(currentState, newStateChanges);
        await this.persistentCachingService.set(index.getKey(Keys.State), newState);
    }
}

/** @ignore */
class Keys {
    static State = "State";
}
