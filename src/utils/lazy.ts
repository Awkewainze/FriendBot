/**
 * Gets a value once on call, then returns the same value on subsequent gets.
 * @typeParam T Stored value type.
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
        if (!this.instantiated) {
            this.value = this.provider();
            this.instantiated = true;
        }
        return this.value;
    }
}
