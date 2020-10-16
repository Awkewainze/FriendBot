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

export interface CachingService {
    get<T>(key: string): Promise<T>;
    getOrAdd<T>(key: string, value: T, cacheTime?: Duration): Promise<T>;
    set<T>(key: string, value: T, cacheTime?: Duration): Promise<void>;
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
export class InMemoryCachingService implements CachingService {
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
export class RedisCachingService implements CachingService {
    get<T>(key: string): Promise<T> {
        throw new Error("Method not implemented.");
    }
    getOrAdd<T>(key: string, value: T, cacheTime: Duration = Duration.forever()): Promise<T> {
        throw new Error("Method not implemented.");
    }
    set<T>(key: string, value: T, cacheTime: Duration = Duration.forever()): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
