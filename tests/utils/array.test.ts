import { getUniques } from "../../src/utils/array";

describe("array utils", () => {
    describe("getUniques", () => {
        it("should trivially pass through simple arrays", () => {
            expect(getUniques([[0], [1]], [])).toStrictEqual([0, 1]);
        });
        it("should replace previous value to avoid undefined", () => {
            expect(getUniques([[0, 1], [0]], [])).toStrictEqual([1, 0]);
        });

        it("should go back as far as need to replace value", () => {
            expect(getUniques([[0, 1, 2], [0, 1], [0]], [])).toStrictEqual([2, 1, 0]);
        });

        it("should return undefined when no value is possible", () => {
            expect(getUniques([[0, 1], [0, 1], [0]], [])).toStrictEqual([0, 1, undefined]);
        });

        it("should return default value when no value is possible", () => {
            expect(getUniques([[0, 1], [0, 1], [0]], [-1])).toStrictEqual([0, 1, -1]);
        });

        it("should return shortened array when no value is possible and stopOnUnresolvable is set to true", () => {
            expect(getUniques([[0, 1], [0, 1], [0]], [], true)).toStrictEqual([0, 1]);
        });

        it("should return default value, then shortened when default values are used, no value is possible, and stopOnUnresolvable is set to true", () => {
            expect(getUniques([[0, 1], [0, 1], [0], [0]], [-1], true)).toStrictEqual([0, 1, -1]);
        });

        it("should work with other types", () => {
            expect(getUniques([["cat", "dog"], ["cat"]], [])).toStrictEqual(["dog", "cat"]);
        });
    });
});
