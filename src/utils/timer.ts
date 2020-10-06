/** A simple and smart wrapper around [NodeJS.Timeout]{@link https://nodejs.org/api/timers.html#timers_class_timeout} */
export class Timer {
    private timeout: NodeJS.Timeout;
    private callbacks: Array<() => void> = [];

    /**
     * Create a new timer, does not start until {@link start} method is called.
     * @param timeInMs Time in milliseconds this {@link Timer} will wait for.
     */
    public constructor(private readonly timeInMs: number) {
        this.resetPromise();
    }

    /**
     * Starts the {@link Timer} from the beginning if it's not running, or does nothing if already running.
     * @returns This currently running {@link Timer}.
     */
    public start(): this {
        if (this.timeout) return this;
        this.timeout = setTimeout(() => this.timeReached(), this.timeInMs);
        return this;
    }

    /**
     * Stops the {@link Timer}, or does nothing if {@link Timer} is already stopped.
     * @returns This currently stopped {@link Timer}.
     */
    public stop(): this {
        if (!this.timeout) return this;
        clearTimeout(this.timeout);
        delete this.timeout;
        return this;
    }

    /**
     * Resets the {@link Timer} and starts it.
     * @returns This currently running {@link Timer}.
     */
    public reset(): this {
        if (this.timeout) {
            this.timeout.refresh();
            return this;
        }
        return this.start();
    }

    /**
     * Add a callback for when this {@link Timer} reaches end.
     * @param callback Method to be executed on {@link Timer} end.
     * @returns This {@link Timer}.
     */
    public addCallback(callback: Callback): this {
        this.callbacks.push(callback);
        return this;
    }

    /**
     * Returns the awaitable so you can use this {@link Timer} more asynchronously.
     * !(DANGER) Do not await a stopped {@link Timer}, you will be waiting a long time (i.e. forever).
     * @returns Promise that will resolve when {@link Timer} reaches end.
     */
    public asAwaitable(): Promise<void> {
        return this.promise;
    }

    private timeReached(): void {
        this.callbacks.forEach(x => x());
        this.promiseResolvable();
        this.resetPromise();
    }

    private promiseResolvable: () => void;
    private promise: Promise<void>;
    private resetPromise(): void {
        this.promise = new Promise(resolve => (this.promiseResolvable = resolve));
    }
}
