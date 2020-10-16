/**
 * Class contain methods for checking conditions.
 *
 * Based on [Guava's Preconditions]{@link https://guava.dev/releases/19.0/api/docs/com/google/common/base/Preconditions.html}. But a bit simpler.
 *
 * Methods starting with `verify` throw on failure, while methods starting with `is` return `boolean`.
 * @category Utility
 */

export class Check {
    /**
     * Throws if condition is false
     * @param condition Throws if false.
     * @param errorOrMsg Error or message to be used instead of generic.
     */
    static verify(condition: boolean, errorOrMsg?: string | Error): void {
        if (!condition) {
            this.throwBasedOnType(errorOrMsg || "Condition failed");
        }
    }

    /**
     * Throws if value is `null` or `undefined`.
     * @param value Throws if `null` or `undefined`.
     * @param errorOrMsg Error or message to be used instead of generic.
     * @typeParam T Type of value being check for null.
     */
    static verifyNotNull<T>(value: T, errorOrMsg?: string | Error): void {
        if (value === null || value === undefined) {
            this.throwBasedOnType(errorOrMsg || "Value is null");
        }
    }

    /**
     * Throws if value is not a number, zero, or negative.
     * @param value Throws if not a number, zero, or negative.
     * @param errorOrMsg Error or message to be used instead of generic.
     */
    static verifyPositive(value: number, errorOrMsg?: string | Error): void {
        if (typeof value !== "number" || value <= 0) {
            this.throwBasedOnType(errorOrMsg || "Value is not positive");
        }
    }

    /**
     * Throws if value is not a number or negative.
     * @param value Throws if not a number or negative.
     * @param errorOrMsg Error or message to be used instead of generic.
     */
    static verifyNotNegative(value: number, errorOrMsg?: string | Error): void {
        if (typeof value !== "number" || value < 0) {
            this.throwBasedOnType(errorOrMsg || "Value is negative");
        }
    }

    private static throwBasedOnType(errorOrMsg: string | Error): void {
        if (this.isNotNull(errorOrMsg)) {
            if (typeof errorOrMsg == "string") {
                throw new Error(errorOrMsg);
            }
            if (errorOrMsg instanceof Error) {
                throw errorOrMsg;
            }
        }
    }

    /**
     * Checks if a value is `null` or `undefined`.
     * @param value Value to check if `null` or `undefined`.
     * @typeParam T Type of the value.
     * @returns `true` if the value is`null` or `undefined`, otherwise `false`.
     */
    static isNull<T>(value: T): boolean {
        return value === null || value === undefined;
    }

    /**
     * Checks if a value is not `null` or `undefined`.
     * @param value Value to check if not `null` or `undefined`.
     * @typeParam T Type of the value.
     * @returns `true` if the value is not `null` or `undefined`, otherwise `false`.
     */
    static isNotNull<T>(value: T): boolean {
        return !this.isNull(value);
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
