import {Optional} from "../../src/utils";

describe("optional", () => {
    it("should return not empty properly", () => {
        expect(Optional.of("foo").isPresent()).toBeTruthy();
    });

    it("should return empty properly", () => {
        expect(Optional.empty().isPresent()).toBeFalsy();
    });

    it("should get value or throw error", () => {
        expect(Optional.of("foo").get()).toEqual("foo");
        expect(() => Optional.empty().get()).toThrowError();
    });

    it("should trigger callback for ifPresent", () => {
        const mockFn = jest.fn();

        Optional.of("foo").ifPresent(mockFn);
        Optional.empty().ifPresent(mockFn);

        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should return orElse correctly", () => {
        expect(Optional.of("foo").orElse("bar")).toEqual("foo");
        expect(Optional.empty().orElse("bar")).toEqual("bar");
    });

    it("should call orElseGet provider correctly", () => {
        const provider = () => "bar";
        expect(Optional.of("foo").orElseGet(provider)).toEqual("foo");
        expect(Optional.empty().orElseGet(provider)).toEqual("bar");
    });

    it("should trigger orElseThrow correctly", () => {
        const err = new Error("Oh no");
        const provider = () => err;
        expect(Optional.of("foo").orElseThrow(provider)).toEqual("foo");
        expect(() => Optional.empty().orElseThrow(provider)).toThrowError(err);
    });

    it("should filter correctly", () => {
        expect(Optional.of("foo").filter(() => true).get()).toEqual("foo");
        expect(Optional.empty().filter(() => true).isPresent()).toBeFalsy();
        expect(Optional.of("foo").filter(() => false).isPresent()).toBeFalsy();
    });

    it("should flatMap correctly", () => {
        const mapper = (s: string): Optional<string[]> => Optional.of(s.split(""));
        const expected = "foo".split("");
        expect(Optional.of("foo").flatMap(mapper).get()).toEqual(expected);
        expect(Optional.empty().flatMap(mapper).isPresent()).toBeFalsy();
    });

    it("should map properly", () => {
        const mapper = (s: string): Number => Number(s);

        expect(Optional.of("12").map(mapper).get()).toEqual(12);
        expect(Optional.empty().map(mapper).isPresent()).toBeFalsy();
    });
});