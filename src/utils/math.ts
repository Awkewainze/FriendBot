/**
 * Gets a random number from zero (inclusive) to max (exclusive).
 * @param max Max number exclusive.
 * @category Math
 */
export function randInt(max: number): number {
    return Math.floor(Math.random() * max);
}

/**
 * Get a random element from given array.
 * @param arr Array to select from.
 * @typeParam T Type of values in array.
 * @category Math
 */
export function selectRandom<T>(arr: Array<T>): T {
    if (!arr || !Array.isArray(arr) || arr.length === 0) throw new Error("Invalid input array");
    return arr[randInt(arr.length)];
}
