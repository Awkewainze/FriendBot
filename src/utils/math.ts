import { Check } from "@awkewainze/checkverify";
import crypto from "crypto";

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
    Check.verify(Array.isArray(arr) && arr.length > 0, "Invalid input array");
    return arr[randInt(arr.length)];
}

export function cryptoRandInt(max: number): number {
    Check.verify(max < 248, "max value must be below 248");
    return crypto.randomInt(max);
}

export function cryptoSelectRandom<T>(arr: Array<T>): T {
    Check.verify(Array.isArray(arr) && arr.length > 0, "Invalid input array");
    return arr[cryptoRandInt(arr.length)];
}
