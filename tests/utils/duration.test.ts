import { Duration } from "../../src/utils";

describe("duration", () => {
    describe("between", () => {
        it("should provide a value between the two provided durations", () => {
            let betweenDuration = Duration.between(Duration.fromDays(4), Duration.fromDays(5));
            expect(betweenDuration.toDays()).toBeLessThan(5);
            expect(betweenDuration.toDays()).toBeGreaterThanOrEqual(4);
        });
    });
});