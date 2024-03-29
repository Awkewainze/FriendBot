import * as math from "../../src/utils/math";

describe("math", () => {
    it("should return a random number", () => {
        const random = math.selectRandom([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

        expect(random).toBeGreaterThanOrEqual(1);
        expect(random).toBeLessThanOrEqual(10);
    });

    it("should return a true random number", () => {
        const random = math.cryptoRandInt(100);

        expect(random).toBeGreaterThan(-1);
        expect(random).toBeLessThan(100);
    });
});
