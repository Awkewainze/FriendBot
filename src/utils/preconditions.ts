/**
 * Class contain methods for checking conditions.
 *
 * Based heavily on [Guava's Preconditions]{@link https://guava.dev/releases/19.0/api/docs/com/google/common/base/Preconditions.html}.
 *
 * Methods starting with `check` throw on failure, while methods starting with `is` return `boolean`.
 * @category Utility
 */

export class Preconditions {
    /**
     * Throws if condition is false
     * @param condition Throws if false.
     * @param errorMsg Error message to be used instead of generic.
     */
    static check(condition: boolean, errorMsg?: string): void {
        if (!condition) throw new Error(errorMsg || "Condition failed");
    }

    /**
     * Throws if value is `null` or `undefined`.
     * @param value Throws if `null` or `undefined`.
     * @param errorMsg Error message to be used instead of generic.
     */
    static checkNotNull<T>(value: T, errorMsg?: string): void {
        if (value === null || value === undefined) throw new Error(errorMsg || "Value is null");
    }

    /**
     * Throws if value is not a number, zero, or negative.
     * @param value Throws if not a number, zero, or negative.
     * @param errorMsg Error message to be used instead of generic.
     */
    static checkPositive(value: number, errorMsg?: string): void {
        if (typeof value !== "number" || value <= 0) throw new Error(errorMsg || "Value is not positive");
    }

    /**
     * Throws if value is not a number or negative.
     * @param value Throws if not a number or negative.
     * @param errorMsg Error message to be used instead of generic.
     */
    static checkNotNegative(value: number, errorMsg?: string): void {
        if (typeof value !== "number" || value < 0) throw new Error(errorMsg || "Value is negative");
    }

    /**
     * Checks if a value is not `null` or `undefined`.
     * @param value Value to check if not `null` or `undefined`.
     * @returns `true` if the value is not `null` or `undefined`, otherwise `false`.
     */
    static isNotNull<T>(value: T): boolean {
        return value !== null && value !== undefined;
    }

    /**
     * Checks if a value is positive.
     * @param value Value to check if positive.
     * @returns `true` if the value is positive, otherwise `false`.
     */
    static isPositive(value: number): boolean {
        return typeof value === "number" && value > 0;
    }

    /**
     * Checks if value is not negative.
     * @param value To check if not negative.
     * @returns `true` if the value is not negative, otherwise `false`.
     */
    static isNotNegative(value: number): boolean {
        return typeof value === "number" && value >= 0;
    }
}
