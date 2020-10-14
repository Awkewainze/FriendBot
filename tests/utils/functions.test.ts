import { execute, memoize, ping, provide } from "../../src/utils/functions";

describe("functions", () => {
    describe("ping", () => {
        it("should return given value", () => {
            expect(ping("test")).toBe("test");
            expect(ping(1)).toBe(1);
            expect(ping(-1)).toBe(-1);
            expect(ping({foo: "bar"})).toStrictEqual({foo: "bar"});
            expect(ping(["foo", "bar"])).toStrictEqual(["foo", "bar"]);
        })
    });
    describe("provide", () => {
        it("should return the result of the function", () => {
            const fn = provide(5);
            expect(fn()).toBe(5);
        });
    });
    describe("execute", () => {
        it("should execute the function", () => {
            const mockFn = jest.fn();
            execute(mockFn);
            expect(mockFn).toBeCalledTimes(1);
        });
    });
    describe("memoize", () => {
        it("should only call the original function once", () => {
            const mockFn = jest.fn(x => x + 1);
            const memoizedSimpleFn = memoize(mockFn) as (x: number) => number;
            expect(memoizedSimpleFn(1)).toBe(2);
            expect(memoizedSimpleFn(1)).toBe(2);
            expect(mockFn).toBeCalledTimes(1);
        });
        it("should return multiple results", () => {
            const mockFn = jest.fn(x => x + 1);
            const memoizedSimpleFn = memoize(mockFn);
            expect(memoizedSimpleFn(1)).toBe(2);
            expect(memoizedSimpleFn(1)).toBe(2);
            expect(memoizedSimpleFn(2)).toBe(3);
            expect(mockFn).toBeCalledTimes(2);
        });
        it("should work with no parameters", () => {
            const mockFn = jest.fn(() => "results");
            const memoizedSimpleFn = memoize(mockFn);
            expect(memoizedSimpleFn()).toBe("results");
            expect(memoizedSimpleFn()).toBe("results");
            expect(mockFn).toBeCalledTimes(1);
        });
        it("should work with no results", () => {
            const mockFn = jest.fn((x: string) => {});
            const memoizedSimpleFn = memoize(mockFn);
            expect(memoizedSimpleFn("test")).toBe(undefined);
            expect(memoizedSimpleFn("test")).toBe(undefined);
            expect(mockFn).toBeCalledTimes(1);
        });
        it("should work with no parameters or results", () => {
            const mockFn = jest.fn();
            const memoizedSimpleFn = memoize(mockFn);
            expect(memoizedSimpleFn()).toBe(undefined);
            expect(memoizedSimpleFn()).toBe(undefined);
            expect(mockFn).toBeCalledTimes(1);
        });
    });
});
