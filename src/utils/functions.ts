/**
 * No operation, a method that does nothing. More useful than you would think, especially for testing.
 * @category SimpleFunction
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop(): void {}

/**
 * Function that returns given value.
 * @param value Value to return.
 * @returns Provided value.
 * @category SimpleFunction
 */
export function ping<T>(value: T): T {
    return value;
}

/**
 * Wraps an value and returns it when the returned method is called.
 * @param value Value to return.
 * @typeParam T Type that will be returned from provider.
 * @returns Provider which returns the given value.
 * @category SimpleFunction
 */
export function provide<T>(value: T): Provider<T> {
    return () => value;
}

/**
 * Calls a given function and returns it's result. This is pretty useful for an array of methods.
 *
 * i.e. `[doThing1, doThing2.bind(this), () => doThing3()].forEach(execute);` (usually with a more dynamic list)
 * @param provider Method that will return a value (or void).
 * @typeParam T Type that will be returned from provider, could be void.
 * @returns The result of the method.
 * @category SimpleFunction
 */
export function execute<T>(provider: Provider<T>): T {
    return provider();
}
