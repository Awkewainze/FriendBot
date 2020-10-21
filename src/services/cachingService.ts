import { RedisClient } from "redis";
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

export interface CachingService {
    get<T>(key: string): Promise<T>;
    getOrAdd<T>(key: string, value: T, cacheTime?: Duration): Promise<T>;
    exists(key: string): Promise<boolean>;
    set<T>(key: string, value: T, cacheTime?: Duration): Promise<void>;
}

/**
 * Holds value even if bot is restarted
 * * Values must be serializable!
 */
export interface PersistentCachingService {
    get<T extends JsonSerializable>(key: string): Promise<T>;
    getOrAdd<T extends JsonSerializable>(key: string, value: T, cacheTime?: Duration): Promise<T>;
    exists(key: string): Promise<boolean>;
    set<T extends JsonSerializable>(key: string, value: T, cacheTime?: Duration): Promise<void>;
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
    private readonly localCache: { [key: string]: unknown } = {};
    private readonly cacheTimers: { [key: string]: Timer } = {};

    async get<T>(key: string): Promise<T> {
        Check.verifyNotNull(this.localCache[key], new KeyNotFoundError(key));
        return this.localCache[key] as T;
    }

    async getOrAdd<T>(key: string, value: T, cacheTime: Duration = Duration.forever()): Promise<T> {
        if (Check.isNull(this.localCache[key])) {
            this.localCache[key] = value;
            if (!cacheTime.isForever()) {
                if (Check.isNotNull(this.cacheTimers[key])) {
                    this.cacheTimers[key].stop();
                }
                this.cacheTimers[key] = Timer.for(cacheTime)
                    .addCallback(() => delete this.localCache[key])
                    .start();
            }
        }

        return this.localCache[key] as T;
    }

    async exists(key: string): Promise<boolean> {
        return Check.isNotNull(this.localCache[key]);
    }

    async set<T>(key: string, value: T, cacheTime: Duration = Duration.forever()): Promise<void> {
        this.localCache[key] = value;
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
export class FakePersistentCachingService implements PersistentCachingService {
    private readonly localCache: { [key: string]: string } = {};
    private readonly cacheTimers: { [key: string]: Timer } = {};

    async get<T extends JsonSerializable>(key: string): Promise<T> {
        Check.verifyNotNull(this.localCache[key], new KeyNotFoundError(key));
        return JSON.parse(this.localCache[key]);
    }

    async getOrAdd<T extends JsonSerializable>(
        key: string,
        value: T,
        cacheTime: Duration = Duration.forever()
    ): Promise<T> {
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

    async set<T extends JsonSerializable>(
        key: string,
        value: T,
        cacheTime: Duration = Duration.forever()
    ): Promise<void> {
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
export class RedisCachingService implements PersistentCachingService {
    constructor(private readonly client: RedisClient) {}
    get<T extends JsonSerializable>(key: string): Promise<T> {
        return new Promise((resolve, reject) => {
            this.client.get(key, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(JSON.parse(result));
            });
        });
    }
    async getOrAdd<T extends JsonSerializable>(
        key: string,
        value: T,
        cacheTime: Duration = Duration.forever()
    ): Promise<T> {
        if (await this.exists(key)) {
            return await this.get(key);
        }

        await this.set(key, value, cacheTime);
        return value;
    }
    exists(key: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.client.exists(key, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (result > 0) {
                    resolve(true);
                    return;
                }
                resolve(false);
            });
        });
    }
    set<T extends JsonSerializable>(key: string, value: T, cacheTime: Duration = Duration.forever()): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.set(key, JSON.stringify(value), "", cacheTime.toMilliseconds(), (err, _) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}
