/**
 * Trivial method containing logic.
 * @category SimpleFunction
 */
declare type Callback = () => void;
/**
 * Represents the method that defines a set of criteria and determines whether the specified value meets those criteria.
 * @param value Value to compare against within this method.
 * @typeParam T Type of the value to compare.
 * @returns `true` if value meets criteria defined within this method, otherwise `false`.
 * @category SimpleFunction
 */
declare type Predicate<T> = (value: T) => boolean;
/**
 * Represents a method that returns a single value.
 * @typeParam T Type of the value that will be returned.
 * @returns Value.
 * @category SimpleFunction
 */
declare type Provider<T> = () => T;
/**
 * Encapsulates a method that has a single parameter and does not return a value.
 * @param value Value that the method takes in.
 * @typeParam T Type of the value provided.
 * @category SimpleFunction
 */
declare type Consumer<T> = (value: T) => void;
/**
 * Method that transforms a value.
 * @param value Value to be transformed.
 * @typeParam T Input value's type.
 * @typeParam U Output value's type.
 * @category SimpleFunction
 */
declare type Mapper<T, U> = (value: T) => U;
/**
 * Async trivial method containing logic.
 * @category SimpleFunction
 */
declare type AsyncCallback = () => Promise<void>;
/**
 * Async method that defines a set of criteria and determines whether the specified value meets those criteria.
 * @param value Value to compare against within this method.
 * @typeParam T Type of the value to compare.
 * @returns  A promise that returns `true` if value meets criteria defined within this method, otherwise `false`.
 * @category SimpleFunction
 */
declare type AsyncPredicate<T> = (value: T) => Promise<boolean>;
/**
 * Async method that returns a single value.
 * @typeParam T Type of the value that will be returned.
 * @returns Value.
 * @category SimpleFunction
 */
declare type AsyncProvider<T> = () => Promise<T>;
/**
 * Async method that has a single parameter and does not return a value.
 * @param value Value that the method takes in.
 * @typeParam T Type of the value provided.
 * @category SimpleFunction
 */
declare type AsyncConsumer<T> = (value: T) => Promise<void>;
/**
 * Async method that transforms a value.
 * @param value Value to be transformed.
 * @typeParam T Input value's type.
 * @typeParam U Output value's type.
 * @category SimpleFunction
 */
declare type AsyncMapper<T, S> = (value: T) => Promise<S>;
