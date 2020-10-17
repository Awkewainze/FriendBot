import { inject, Lifecycle, scoped, singleton } from "tsyringe";
import { Check, Duration, Timer } from "../utils";

@scoped(Lifecycle.ResolutionScoped)
export class Index {
    constructor(private readonly path: Array<string> = []) {}

    addScope(scope: string): Index {
        return new Index([...this.path, scope]);
    }

    getKey(keyName: string): string {
        return [...this.path, keyName].join("/");
    }
}

@scoped(Lifecycle.ResolutionScoped)
export class GuildScopedIndex extends Index {
    constructor(@inject("GuildId") guildId: string) {
        super([guildId]);
    }
}

@scoped(Lifecycle.ResolutionScoped)
export class GuildAndMemberScopedIndex extends Index {
    constructor(@inject("GuildId") guildId: string, @inject("GuildMemberId") memberId: string) {
        super([guildId, memberId]);
    }
}

@scoped(Lifecycle.ResolutionScoped)
export class GuildMemberAndChannelScopedIndex extends Index {
    constructor(
        @inject("GuildId") guildId: string,
        @inject("GuildMemberId") memberId: string,
        @inject("MessageChannelId") channelId: string
    ) {
        super([guildId, memberId, channelId]);
    }
}

export abstract class CachingService {
    get type(): "Persistent" | "Nonpersistent" {
        return "Nonpersistent";
    }
    abstract get<T>(key: string): Promise<T>;
    abstract getOrAdd<T>(key: string, value: T, cacheTime?: Duration): Promise<T>;
    abstract exists(key: string): Promise<boolean>;
    abstract set<T>(key: string, value: T, cacheTime?: Duration): Promise<void>;
}

export abstract class PersistentCachingService extends CachingService {
    get type(): "Persistent" | "Nonpersistent" {
        return "Persistent";
    }
}

export class KeyNotFoundError extends Error {
    readonly key: string;
    constructor(key: string) {
        super("Key not found: " + key);
        this.name = "KeyNotFoundError";
        this.key = key;
    }
}

@singleton()
export class InMemoryCachingService extends CachingService {
    private readonly localCache: { [key: string]: string } = {};
    private readonly cacheTimers: { [key: string]: Timer } = {};

    async get<T>(key: string): Promise<T> {
        Check.verifyNotNull(this.localCache[key], new KeyNotFoundError(key));
        return JSON.parse(this.localCache[key]);
    }

    async getOrAdd<T>(key: string, value: T, cacheTime: Duration = Duration.forever()): Promise<T> {
        if (Check.isNull(this.localCache[key])) {
            this.localCache[key] = JSON.stringify(value);
            if (!cacheTime.isForever()) {
                if (Check.isNotNull(this.cacheTimers[key])) {
                    this.cacheTimers[key].stop();
                }
                this.cacheTimers[key] = Timer.for(cacheTime)
                    .addCallback(() => delete this.localCache[key])
                    .start();
            }
        }

        return JSON.parse(this.localCache[key]);
    }

    async exists(key: string): Promise<boolean> {
        return Check.isNotNull(this.localCache[key]);
    }

    async set<T>(key: string, value: T, cacheTime: Duration = Duration.forever()): Promise<void> {
        this.localCache[key] = JSON.stringify(value);
        if (Check.isNotNull(this.cacheTimers[key])) {
            this.cacheTimers[key].stop();
            delete this.cacheTimers[key];
        }
        if (!cacheTime.isForever()) {
            this.cacheTimers[key] = Timer.for(cacheTime)
                .addCallback(() => delete this.localCache[key])
                .start();
        }
    }
}

/**
 * Just uses same logic as InMemoryCachingService, good for temporary use if Redis isn't available, or for testing.
 * @ignore
 */
@singleton()
export class FakePersistentCachingService extends PersistentCachingService {
    private readonly localCache: { [key: string]: string } = {};
    private readonly cacheTimers: { [key: string]: Timer } = {};

    async get<T>(key: string): Promise<T> {
        Check.verifyNotNull(this.localCache[key], new KeyNotFoundError(key));
        return JSON.parse(this.localCache[key]);
    }

    async getOrAdd<T>(key: string, value: T, cacheTime: Duration = Duration.forever()): Promise<T> {
        if (Check.isNull(this.localCache[key])) {
            this.localCache[key] = JSON.stringify(value);
            if (!cacheTime.isForever()) {
                if (Check.isNotNull(this.cacheTimers[key])) {
                    this.cacheTimers[key].stop();
                }
                this.cacheTimers[key] = Timer.for(cacheTime)
                    .addCallback(() => delete this.localCache[key])
                    .start();
            }
        }

        return JSON.parse(this.localCache[key]);
    }

    async exists(key: string): Promise<boolean> {
        return Check.isNotNull(this.localCache[key]);
    }

    async set<T>(key: string, value: T, cacheTime: Duration = Duration.forever()): Promise<void> {
        this.localCache[key] = JSON.stringify(value);
        if (Check.isNotNull(this.cacheTimers[key])) {
            this.cacheTimers[key].stop();
            delete this.cacheTimers[key];
        }
        if (!cacheTime.isForever()) {
            this.cacheTimers[key] = Timer.for(cacheTime)
                .addCallback(() => delete this.localCache[key])
                .start();
        }
    }
}

@singleton()
export class RedisCachingService extends PersistentCachingService {
    get<T>(key: string): Promise<T> {
        throw new Error("Method not implemented.");
    }
    getOrAdd<T>(key: string, value: T, cacheTime: Duration = Duration.forever()): Promise<T> {
        throw new Error("Method not implemented.");
    }
    exists(key: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    set<T>(key: string, value: T, cacheTime: Duration = Duration.forever()): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
