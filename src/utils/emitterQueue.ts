import { Check } from "@awkewainze/checkverify";
import { TypedEmitter } from 'tiny-typed-emitter';
import { shuffle } from "./array";

export type Awaitable<T> = T | PromiseLike<T>;

export interface QueueEvents<T> {
    // When the queue changes in any way.
    "change": (oldQueue: Array<T>, newQueue: Array<T>) => void;
    // When new values are enqueued.
    "enqueue": (values: T[]) => void;
    // When new values are dequeued.
    "dequeue": (values: T[]) => void;
}

/**
 *
 */
export class EmitterQueue<T> extends TypedEmitter<QueueEvents<T>> {
    private _data: T[] = [];
    /** A clone of the underlying array. */
    get data(): Array<T> {
        return [...this._data];
    }
    get length(): number {
        return this._data.length;
    }

    enqueue(...values: T[]): void {
        const old = this.data;
        this._data.push(...values);
        this.emit("enqueue", values);
        this.emit("change", old, this.data);
    }

    peek(amount: number = 1): T[] {
        Check.verifyPositive(amount);
        return this._data.slice(0, amount);
    }

    dequeue(amount: number = 1): T[] {
        Check.verifyPositive(amount);
        const old = this.data;
        const values: T[] = [];
        for (let count = 0; count < amount && this._data.length > 0; count++) {
            values.push(this._data.shift());
        }
        this.emit("dequeue", values);
        this.emit("change", old, this.data);
        return values;
    }

    replace(newQueue: T[]): void {
        const old = this.data;
        this._data = [...newQueue];
        this.emit("change", old, this.data);
    }

    shuffle(): void {
        const newQueue = this.data;
        shuffle(newQueue)
        this.replace(newQueue);
    }

    clear(): void {
        this.replace([]);
    }
}
