import { Duration } from "../../src/utils/duration";
import { Timer } from "../../src/utils/timer";

describe("timer", () => {
    it("should callback at the end of the timer", () => {
        jest.useFakeTimers();
        const mockFn = jest.fn();
        Timer.for(Duration.fromSeconds(1)).addCallback(mockFn).start();

        expect(mockFn).not.toBeCalled();
        jest.runAllTimers();
        expect(mockFn).toBeCalledTimes(1);
    });
    it("should not callback when not started", () => {
        jest.useFakeTimers();
        const mockFn = jest.fn();
        Timer.for(Duration.fromSeconds(1)).addCallback(mockFn);

        expect(mockFn).not.toBeCalled();
        jest.runAllTimers();
        expect(mockFn).not.toBeCalled();
    });
    it("should not callback when stopped", () => {
        jest.useFakeTimers();
        const mockFn = jest.fn();
        const timer = Timer.for(Duration.fromSeconds(1)).addCallback(mockFn).start();
        jest.runTimersToTime(500);
        timer.stop();
        jest.runAllTimers();
        expect(mockFn).not.toBeCalled();

    });
    it("should call multiple callbacks at the end of the timer", () => {
        jest.useFakeTimers();
        const mockFn1 = jest.fn();
        const mockFn2 = jest.fn();
        Timer.for(Duration.fromSeconds(1)).addCallback(mockFn1).addCallback(mockFn2).start();

        expect(mockFn1).not.toBeCalled();
        expect(mockFn2).not.toBeCalled();
        jest.runAllTimers();
        expect(mockFn1).toBeCalledTimes(1);
        expect(mockFn2).toBeCalledTimes(1);
    });
});