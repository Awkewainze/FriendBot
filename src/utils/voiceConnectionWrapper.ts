import {
    BitFieldResolvable,
    SpeakingString,
    StreamDispatcher,
    StreamOptions,
    VoiceBroadcast,
    VoiceConnection
} from "discord.js";
import moment, { Moment } from "moment";
import { Readable } from "stream";
import { noop } from "./functions";
import { Preconditions } from "./preconditions";
import { Timer } from "./timer";

/**
 * Wrapper for Discord's [VoiceConnection](https://discord.js.org/#/docs/main/stable/class/VoiceConnection) that
 * keeps track of activity so you can customize things to do when inactive (usually for auto-disconnecting).
 */
export class ActivityTrackingVoiceConnection {
    private _wrappedVoiceConnection: VoiceConnection;
    private _lastActivity: Moment;
    private _isCurrentlyActive = false;
    private get isCurrentlyActive(): boolean {
        return this._isCurrentlyActive;
    }
    private set isCurrentlyActive(value: boolean) {
        this._isCurrentlyActive = value;
        if (value) {
            this.timer.stop();
        } else {
            this.timer.start();
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    /**
     * Gets the last activity detected on this connection. Returns `now` if currently active
     * @returns Moment of last activity, is now if currently active.
     */
    public get lastActivity(): Moment {
        return this.isCurrentlyActive ? moment() : this._lastActivity;
    }

    /**
     * Gets the underlying Discord [VoiceConnection](https://discord.js.org/#/docs/main/stable/class/VoiceConnection).
     *
     * * This shouldn't be needed most of the time, but if you know what you're doing, go for it.
     * *(WARNING) Does not track voice activity so may disconnect mid action even when using this.
     * @returns Underlying [VoiceConnection](https://discord.js.org/#/docs/main/stable/class/VoiceConnection)
     */
    public get connection(): VoiceConnection {
        return this._wrappedVoiceConnection;
    }

    /**
     * Wraps a [VoiceConnection](https://discord.js.org/#/docs/main/stable/class/VoiceConnection) in voice activity tracking logic.
     * @param connection [VoiceConnection](https://discord.js.org/#/docs/main/stable/class/VoiceConnection) to wrap.
     * @returns {@link ActivityTrackingVoiceConnection} wrapping the provided connection.
     */
    public static wrapConnection(connection: VoiceConnection): ActivityTrackingVoiceConnection {
        const activityTrackingVC = new ActivityTrackingVoiceConnection();
        activityTrackingVC._wrappedVoiceConnection = connection;
        activityTrackingVC.resetLastActivity();
        return activityTrackingVC;
    }

    /**
     * Disconnect from the voice channel and cleans up underlying connection and wrapper.
     *
     * !(DANGER) Do not continue using this after disconnect.
     */
    public disconnect(): void {
        this.resetLastActivity();
        this.timer.stop();
        delete this.timer;
        this._wrappedVoiceConnection.disconnect();
    }

    /** See {@link https://discord.js.org/#/docs/main/stable/class/VoiceConnection?scrollTo=play} */
    public play(input: VoiceBroadcast | Readable | string, options?: StreamOptions): StreamDispatcher {
        const stream = this._wrappedVoiceConnection.play(input, options);
        this.isCurrentlyActive = true;

        stream.once("finish", () => {
            this.isCurrentlyActive = false;
        });
        return stream;
    }

    /** See {@link https://discord.js.org/#/docs/main/stable/class/VoiceConnection?scrollTo=setSpeaking} */
    public setSpeaking(value: BitFieldResolvable<SpeakingString>): void {
        this._wrappedVoiceConnection.setSpeaking(value);
    }

    /**
     * See {@link https://nodejs.org/dist/latest/docs/api/events.html#events_emitter_on_eventname_listener}
     *
     * [Events]{@link https://discord.js.org/#/docs/main/stable/class/VoiceConnection?scrollTo=e-authenticated}
     */
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    public on(event: string, listener: (...args: Array<any>) => void): VoiceConnection {
        return this._wrappedVoiceConnection.on(event, listener);
    }

    /**
     * See {@link https://nodejs.org/dist/latest/docs/api/events.html#events_emitter_once_eventname_listener}
     *
     * [Events]{@link https://discord.js.org/#/docs/main/stable/class/VoiceConnection?scrollTo=e-authenticated}
     */
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    public once(event: string, listener: (...args: Array<any>) => void): VoiceConnection {
        return this._wrappedVoiceConnection.on(event, listener);
    }

    private timer: Timer;
    /**
     * Subscribe to when inactivity reaches provided time threshold.
     *
     * ![WARNING] For simplicity's sake, only 1 listener can exist, so if this method is called more than once, an error will throw.
     * ![WARNING] This may change in the future.
     * @param seconds Time in seconds of inactivity to wait for to call provided consumer.
     * @param consumer Method to be provided with the connection once inactive for long enough.
     */
    public whenInactiveForSeconds(seconds: number, consumer: Consumer<ActivityTrackingVoiceConnection>): this {
        if (Preconditions.isNotNull(this.timer)) {
            throw new Error("Cannot create additional timers, submit a bug if you want this.");
        }
        this.timer = new Timer(seconds * 1000);
        this.timer.addCallback(() => {
            consumer(this);
        });
        return this;
    }

    private resetLastActivity(): void {
        this._lastActivity = moment();
        (this.timer?.reset.bind(this.timer) || noop)();
    }
}
