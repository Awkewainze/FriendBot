import { shuffle } from "../../utils";
import { Track } from "./models/track";

interface QueuedTrack {
    queuedBy: string;
    track: Track;
}

export class TrackQueue {
    private explicitQueue!: Array<QueuedTrack>;
    private passiveQueue!: Array<QueuedTrack>;

    constructor() {
        this.explicitQueue = [];
        this.passiveQueue = [];
    }

    /**
     * Add a track to the explicit queue
     * @param userId
     * @param track
     */
    addNext(userId: string, track: Track): void {
        // log.verbose(`${userId} Adding Next ${track.listing.shortName}`)
        this.explicitQueue.push({ track, queuedBy: userId });
    }

    /**
     * Adds a track to the passive queue
     * @param userId
     * @param track
     */
    add(userId: string, track: Track): void {
        // log.verbose(`${userId} Adding ${track.listing.shortName}`)
        this.passiveQueue.push({ track, queuedBy: userId });
    }

    /**
     * Adds many tracks to the passive queue
     * @param userId
     * @param tracks
     */
    addMany(userId: string, tracks: Array<Track>): void {
        this.passiveQueue.push(...tracks.map(track => ({ track, queuedBy: userId })));
    }

    skip(): void {
        // log.verbose(`Skipping ${this.queue[0]?.track.listing.name}`)

        if (this.explicitQueue.length > 0) {
            this.explicitQueue.shift();
        } else {
            this.passiveQueue.shift();
        }
    }

    clear(): void {
        this.explicitQueue = [];
        this.passiveQueue = [];
    }

    peek(): Track | undefined {
        return this.queue[0]?.track;
    }

    peekDeep(depth = 5): Array<Track> {
        return depth > 0 ? this.queue.slice(0, depth).map(i => i.track) : this.queue.map(i => i.track);
    }

    pop(): Track | undefined {
        if (this.explicitQueue.length > 0) {
            return this.explicitQueue.shift()?.track;
        }

        return this.passiveQueue.shift()?.track;
    }

    shuffle(): void {
        const passiveTemp = [...this.passiveQueue];
        const explicitTemp = [...this.explicitQueue];

        shuffle(passiveTemp);
        this.passiveQueue = passiveTemp;
        shuffle(explicitTemp);
        this.explicitQueue = explicitTemp;
    }

    get first(): Track {
        return this.queue[0].track;
    }

    /**
     * Get rough runtime in seconds
     */
    get runTime(): number {
        const estRunTime = this.queue.reduce((prev, curr) => {
            return prev + curr.track.metadata.duration;
        }, 0);

        return estRunTime;
    }

    get queuedTrackCount(): number {
        return this.queue.length;
    }

    private get queue(): Array<QueuedTrack> {
        return [...this.explicitQueue, ...this.passiveQueue];
    }
}
