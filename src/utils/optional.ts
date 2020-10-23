/**
 * Implementation of the [Java 8+ Optional<T> class](https://docs.oracle.com/javase/8/docs/api/java/util/Optional.html). Documentation mostly copied from Javadoc
 * @typeParam T Type of the stored value.
 * @category Utility
 */
export class Optional<T> {
    private constructor(private readonly value: T, private readonly empty: boolean) {}

    /**
     * Returns an {@link Optional} with the given value.
     * @param value Stored value.
     */
    static of<T>(value: T): Optional<T> {
        return new Optional<T>(value, false);
    }

    /**
     * Returns an {@link Optional} that is empty.
     */
    static empty<T>(): Optional<T> {
        return new Optional<T>(null, true);
    }

    /**
     * If a value is present in this {@link Optional}, returns the value, otherwise throws Error.
     * @returns The stored value.
     * @throws If {@link Optional} is empty.
     */
    get(): T {
        if (!this.empty) return this.value;
        throw new Error("Optional is empty");
    }

    /**
     * Returns if the {@link Optional} contains a value.
     * @returns `true` if there is a value present, otherwise `false`.
     */
    isPresent(): boolean {
        return !this.empty;
    }

    /**
     * If a value is present, invoke the specified consumer with the value, otherwise do nothing.
     * @param consumer Method that will be provided with {@link Optional}'s value if it's present.
     */
    ifPresent(consumer: Consumer<T>): void {
        if (!this.empty) consumer(this.value);
    }

    /**
     * Return the value if present, otherwise return other.
     * @param other Value to be returned if {@link Optional} does not contain a value.
     * @returns Either the {@link Optional}'s value or, if it doesn't exist, the provided value.
     */
    orElse(other: T): T {
        if (!this.empty) return this.value;
        return other;
    }

    /**
     * Return the value if present, otherwise invoke `other` and return the result of that invocation.
     * @param getValue Method that provides a value if {@link Optional} does not contain a value.
     * @returns Either the {@link Optional}'s value or, if it doesn't exist, the value from the provided method.
     */
    orElseGet(getValue: Provider<T>): T {
        if (!this.empty) return this.value;
        return getValue();
    }

    /**
     * Return the contained value, if present, otherwise throw an error to be created by the provided supplier.
     * @param errProvider Method provides an error that will be throw if the {@link Optional} doesn't contain a value.
     * @returns The {@link Optional}'s value.
     * @throws The provide error if empty.
     */
    orElseThrow(errProvider: Provider<Error>): T {
        if (!this.empty) return this.value;
        throw errProvider();
    }

    /**
     * If a value is present and the value matches the given predicate
     * return an {@link Optional} describing the value, otherwise return an empty {@link Optional}.
     * @param predicate Method to filter this {@link Optional} with.
     * @returns {@link Optional} containing the original value or empty. Based on original existence and passing filter.
     */
    filter(predicate: Predicate<T>): Optional<T> {
        if (this.empty || !predicate(this.value)) return Optional.empty<T>();
        return Optional.of(this.value);
    }

    /**
     * If a value is present, apply the provided {@link Optional}-bearing mapping function to it, return that result,
     * otherwise return an empty {@link Optional}.
     * @param mapper Method to transform the {@link Optional}'s value from and returns an {@link Optional}.
     * @typeParam S The new value's type.
     * @returns A new {@link Optional} containing the transformed value or empty.
     */
    flatMap<S>(mapper: Mapper<T, Optional<S>>): Optional<S> {
        if (!this.empty) return mapper(this.value);
        return Optional.empty<S>();
    }

    /**  */
    /**
     * If a value is present, apply the provided mapping function to it,
     * and if the result is non-null, return an {@link Optional} describing the result.
     * @param mapper Method to transform the {@link Optional}'s value from and returns a new value.
     * @typeParam S The new value's type.
     * @returns A new {@link Optional} containing the transformed value or empty.
     */
    map<S>(mapper: Mapper<T, S>): Optional<S> {
        if (!this.empty) return Optional.of(mapper(this.value));
        return Optional.empty<S>();
    }
}
