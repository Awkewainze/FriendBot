/**
 * Gets a value once on call, then returns the same value on subsequent gets.
 * @paramType T Stored value type.
 * @category Utility
 */
export class Lazy<T> {
    private instantiated = false;
    private value: T;

    /**
     * @param provider Method that is called once on first {@link get}.
     * @category Lazy
     */
    public constructor(private readonly provider: Provider<T>) {}

    /**
     * Gets the value, only calls provider on first call.
     * @returns The value from the provider.
     * @category Lazy
     */
    get(): T {
        if (!this.instantiated) this.value = this.provider();
        return this.value;
    }
}

/**
 * Gets an async value once on call, then returns the same value on subsequent gets.
 * @paramType T Stored value type.
 * @category Utility
 */
export class AsyncLazy<T> {
    private instantiated = false;
    private value: T;

    /**
     * @param provider Method that is called once on first {@link get}.
     * @category Lazy
     */
    public constructor(private readonly provider: AsyncProvider<T>) {}

    /**
     * Gets the value, only calls provider on first call.
     * @returns The value from the provider.
     * @category Lazy
     */
    async get(): Promise<T> {
        if (!this.instantiated) this.value = await this.provider();
        return Promise.resolve(this.value);
    }
}
