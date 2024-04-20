import { Duration } from "@awkewainze/simpleduration";
import { Timer } from "@awkewainze/simpletimer";
import {
    AudioPlayer,
    AudioPlayerError,
    AudioPlayerState,
    AudioPlayerStatus, createAudioPlayer,
    createAudioResource,
    CreateVoiceConnectionOptions,
    entersState,
    joinVoiceChannel,
    JoinVoiceChannelOptions,
    VoiceConnection,
    VoiceConnectionDisconnectReason,
    VoiceConnectionState,
    VoiceConnectionStatus
} from "@discordjs/voice";
import { debounceTime, Subject } from "rxjs";
import winston from "winston";
import { CONFIG } from "../../config";
import { SoundInfo, SoundQueue } from "./soundQueue";

export class SoundPlayer {
    private readonly queue: SoundQueue = new SoundQueue();
    private readonly activitySubject = new Subject<void>();

    public voiceConnection: VoiceConnection;
    public readonly audioPlayer: AudioPlayer;

    public constructor(
        private readonly logger: winston.Logger,
        private options: JoinVoiceChannelOptions & CreateVoiceConnectionOptions
    ) {
        this.activitySubject
            .pipe(
                debounceTime(CONFIG.DISCORD.AUTO_DISCONNECT_TIME_MS)
            )
            .subscribe(() => void this.autoDisconnect());

        this.audioPlayer = createAudioPlayer();
        this.audioPlayer.on("stateChange", this.playerStateHandler.bind(this));
        this.audioPlayer.on("error", this.audioPlayErrorHandler.bind(this));
        this.joinVoice();
    }

    public get isPlaying(): boolean {
        return this.audioPlayer.state.status === AudioPlayerStatus.Playing;
    }

    public get nowPlaying(): SoundInfo | null {
        return this.queue.current;
    }

    public get trackCount(): number {
        return this.queue.queue.length;
    }

    public get isDisconnected(): boolean {
        return this.voiceConnection.state.status === VoiceConnectionStatus.Disconnected;
    }

    public get isDestroyed(): boolean {
        return this.voiceConnection.state.status === VoiceConnectionStatus.Destroyed;
    }

    private get channelId(): string {
        return this.options.channelId;
    }

    public playNow(sound: SoundInfo): void {
        this.audioPlayer.play(createAudioResource(sound.url));
    }

    // TODO
    public async enqueue(sound: SoundInfo, enqueueAsNext = false): Promise<void> {
        if (enqueueAsNext) {
            this.queue.addAtPosition(sound, 0);
        } else {
            this.queue.add(sound);
        }
        // await this.processQueue();
    }

    // TODO if destroyed remove from voice activity service map
    public async destroy(): Promise<void> {
        this.voiceConnection.destroy();
    }

    public pause(): void {
        this.audioPlayer.pause(true);
    }

    public unpause(): void {
        this.audioPlayer.unpause();
    }

    public stop(): void {
        this.queue.clear();
        this.audioPlayer.stop(true);
    }

    public shuffle(): void {
        this.queue.shuffle();
    }

    public peek(depth = 5): Array<SoundInfo> {
        return this.queue.queue.peek(depth);
    }

    // TODO
    public disconnect(): void {
        this.voiceConnection.disconnect();
    }

    private joinVoice(): void {
        this.voiceConnection = joinVoiceChannel(this.options);
        this.voiceConnection.on("stateChange", this.voiceConnectionStateHandler.bind(this));
        this.subscribe();
    }

    private subscribe(): void {
        this.voiceConnection.subscribe(this.audioPlayer);
    }

    // TODO Call disconnect instead?
    private async autoDisconnect(): Promise<void> {
        await this.destroy();
    }

    // private async processQueue(force = false): Promise<void> {
    //     if (this.isDestroyed) {
    //         this.log.debug(`player destroyed at process attempt for ${this.channelId} - running rejoin and subscribe`);
    //         this.joinVoice();
    //         // this.subscribe()
    //     }

    //     if (
    //         !force &&
    //         (this.queueLock || this.audioPlayer.state.status !== AudioPlayerStatus.Idle)
    //         // ||      this.queue.queuedTrackCount === 0
    //     ) {
    //         this.log.verbose(
    //             `skipping processing due to state; force=${force}; queueLock=${this.queueLock}; status=${this.audioPlayer.state.status !== AudioPlayerStatus.Idle
    //             }; queuedTrackCount=${this.queue.queuedTrackCount === 0};`
    //         );

    //         // if (this.queue.queuedTrackCount === 0) {
    //         //   this.currentResource = undefined
    //         // }
    //         return;
    //     }

    //     this.queueLock = true;

    //     const nextTrack = this.queue.pop();

    //     // this.log.info(`playing ${nextTrack.listing.shortName}`)

    //     // Be careful in case the skip is forced and the last run
    //     if (nextTrack) {
    //         this.log.silly("process has next track, attempting play");
    //         try {
    //             const next = await nextTrack.toAudioResource();
    //             this.log.debug("audio resouce generated");
    //             this.currentResource = next;
    //             this.currentResource.volume?.setVolume(0.35);
    //             this.audioPlayer.play(this.currentResource);
    //             // TODO
    //             // Golem.setPresenceListening(nextTrack.metadata);

    //             // TODO
    //             // Golem.triggerEvent("queue", this.voiceConnection.joinConfig.guildId);
    //         } catch (error) {
    //             console.error(error);
    //             this.log.error(`error processing queue ${error}`);
    //             this.skip();
    //         }
    //     } else {
    //         this.log.silly("process has no next track, stopping out of caution");
    //         this.stop();
    //         // TODO
    //         // Golem.triggerEvent("queue", this.voiceConnection.joinConfig.guildId);
    //     }

    //     this.queueLock = false;
    // }

    private async playerStateHandler(oldState: AudioPlayerState, newState: AudioPlayerState): Promise<void> {
        this.logger.verbose(`player for ${this.channelId} state change ${oldState.status} => ${newState.status}`);
        if (newState.status !== AudioPlayerStatus.Idle) {
            this.activitySubject.next();
        }
    }


    private readyLock = false;
    private async voiceConnectionStateHandler(_: VoiceConnectionState, newState: VoiceConnectionState): Promise<void> {
        if (newState.status === VoiceConnectionStatus.Disconnected) {
            if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
                try {
                    await entersState(this.voiceConnection, VoiceConnectionStatus.Connecting, 5_000);
                } catch {
                    this.voiceConnection.destroy();
                }
            } else if (this.voiceConnection.rejoinAttempts < 5) {
                /*
                    The disconnect in this case is recoverable, and we also have <5 repeated attempts so we will reconnect.
                */
                await Timer.immediateAwaitable(
                    Duration.fromMilliseconds((this.voiceConnection.rejoinAttempts + 1) * 5_000)
                );
                this.voiceConnection.rejoin();
            } else {
                /*
            The disconnect in this case may be recoverable, but we have no more remaining attempts - destroy.
          */
                this.voiceConnection.destroy();
            }
        } else if (newState.status === VoiceConnectionStatus.Destroyed) {
            /*
          Once destroyed, stop the subscription
        */
            this.stop();
        } else if (
            !this.readyLock &&
            (newState.status === VoiceConnectionStatus.Connecting ||
                newState.status === VoiceConnectionStatus.Signalling)
        ) {
            /*
          In the Signalling or Connecting states, we set a 20 second time limit for the connection to become ready
          before destroying the voice connection. This stops the voice connection permanently existing in one of these
          states.
        */
            this.readyLock = true;
            try {
                await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, 20_000);
            } catch {
                if (this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed)
                    this.voiceConnection.destroy();
            } finally {
                this.readyLock = false;
            }
        }
    }

    private audioPlayErrorHandler(error: AudioPlayerError): void {
        console.error(error);
        this.logger.error(`audio player error occurred ${error.message}`);
    }
}
