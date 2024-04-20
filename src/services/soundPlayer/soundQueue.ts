import { EmitterQueue } from "../../utils/emitterQueue";

export class SoundInfo {
    public readonly id!: string;
    constructor(
        readonly title: string,
        readonly source: "youtube" | "local",
        readonly url: string
    ) {
        this.id = `${title}/${source}/${url}`;
    }
}

export class SoundQueue {
    private _previouslyPlayed = new EmitterQueue<SoundInfo>();
    /** Previous previously played sounds, oldest first */
    public get previouslyPlayed(): EmitterQueue<SoundInfo> {
        return this._previouslyPlayed;
    }
    private _queue = new EmitterQueue<SoundInfo>();
    /** Upcoming sounds to be played. */
    public get queue(): EmitterQueue<SoundInfo> {
        return this._queue;
    }
    private _current: SoundInfo = null;
    /** The current sound being played. */
    public get current(): SoundInfo | null {
        return this._current;
    }

    /**
     * Moves the current playing sound to previously played, and sets the currently playing to the next item in the queue if any.
     * @returns {boolean} if something was moved to current
     */
    public next(): boolean {
        if (this._current !== null) {
            this._previouslyPlayed.enqueue(this._current);
            if (this._previouslyPlayed.length > 10) {
                this._previouslyPlayed.dequeue(this._previouslyPlayed.length - 10);
            }
        }
        if (this._queue.length > 0) {
            this._current = this._queue.dequeue()[0];
            return true;
        }
        this._current = null;
        return false;
    }

    public add(sound: SoundInfo): void {
        this._queue.enqueue(sound);
    }

    public addAtPosition(sound: SoundInfo, position: number = 0): void {
        const newArray = this._queue.data;
        newArray.splice(position, 0, sound);
        this._queue.replace(newArray);
    }

    public removeAtPosition(position: number = 0): void {
        const newArray = this._queue.data;
        newArray.splice(position, 1);
        this._queue.replace(newArray);
    }

    public clear(): void {
        this._queue.clear();
    }

    public clearHistory(): void {
        this._previouslyPlayed.clear();
    }

    public shuffle(): void {
        this._queue.shuffle();
    }
}
