import { EmitterQueue } from "../../src/utils/emitterQueue";

describe("EmitterQueue", () => {
    it("should emit expected events", () => {
        const queue = new EmitterQueue<number>();
        const fn = jest.fn();
        queue.on("enqueue", fn);

        expect(fn).not.toBeCalled();

        queue.enqueue(1, 2, 3);
        expect(fn).toBeCalledWith([1, 2, 3]);
    });
});