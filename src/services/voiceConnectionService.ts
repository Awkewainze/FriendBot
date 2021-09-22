import { Check } from "@awkewainze/checkverify";
import { Duration } from "@awkewainze/simpleduration";
import { StageChannel, VoiceChannel } from "discord.js";
import { onShutdown } from "node-graceful-shutdown";
import { inject, Lifecycle, scoped, singleton } from "tsyringe";
import { ActivityTrackingVoiceConnection, execute } from "../utils";

/**
 * Manages mapping guild to it's respective voice connection.
 * Prefer using GuildScopedVoiceConnectionService in commands unless needed.
 *
 * Singleton.
 * @category Service
 */
@singleton()
export class VoiceConnectionService {
    private readonly guildConnectionMap: Map<string, ActivityTrackingVoiceConnection> = new Map();

    constructor() {
        onShutdown("VoiceConnectionService", async () => {
            this.disconnectFromAll();
        });
    }

    /**
     * Gets an existing voice connection.
     *
     * * Prefer using `getOrCreateConnectionForGuild` unless you want this to fail
     * * on attempt potentially, or if you are sure the connection exists.
     * @param guildId Guild id to lookup voice connection for.
     * @throws If connection does not exist.
     */
    public getConnectionForGuild(guildId: string): ActivityTrackingVoiceConnection {
        Check.verify(this.guildConnectionMap.has(guildId), "Connection does not exist");
        return this.guildConnectionMap.get(guildId);
    }

    /** How long before the service closes the connection. */
    private static readonly DisconnectAfterInactiveForDuration: Duration = Duration.fromMinutes(5);

    /**
     * Gets or creates an existing voice channel.
     *
     * Will disconnect if inactive for {@link DisconnectAfterInactiveForDuration} seconds.
     * @param guildId Guild id to lookup voice connection for.
     * @param channelToUseIfNotInExisting Channel to join if connection does not exist.
     */
    public async getOrCreateConnectionForGuild(
        guildId: string,
        channelToUseIfNotInExisting: VoiceChannel | StageChannel
    ): Promise<ActivityTrackingVoiceConnection> {
        if (!this.guildConnectionMap.has(guildId)) {
            this.guildConnectionMap.set(
                guildId,
                ActivityTrackingVoiceConnection.wrapConnection(
                    await channelToUseIfNotInExisting.join()
                ).whenInactiveForDuration(VoiceConnectionService.DisconnectAfterInactiveForDuration, self => {
                    self.disconnect();
                    this.guildConnectionMap.delete(guildId);
                })
            );
        }
        return this.guildConnectionMap.get(guildId);
    }

    /**
     * Disconnect from voice in guild, if currently in a channel.
     * @param guildId Guild id of which guild to disconnect from if in a voice channel.
     */
    public disconnect(guildId: string): void {
        if (this.guildConnectionMap.has(guildId)) {
            const connection = this.guildConnectionMap.get(guildId);
            connection.disconnect();
            this.guildConnectionMap.delete(guildId);
        }

        if (this.guildOnDisconnects.has(guildId)) {
            this.guildOnDisconnects.get(guildId).forEach(execute);
            this.guildOnDisconnects.delete(guildId);
        }
    }

    /**
     * Disconnects from all voice chats. Should only be used if bot is shutting down.
     */
    public disconnectFromAll(): void {
        for (const guild of this.guildConnectionMap.entries()) {
            this.disconnect(guild[0]);
        }
    }

    private guildOnDisconnects: Map<string, Array<Callback>> = new Map();
    /**
     * Add a callback to be called when this service disconnects from a channel.
     * @param guildId Guild id of which guild to subscribe to.
     * @param callback Callback that will be called when voice channel is disconnected to.
     */
    public subscribeToDisconnect(guildId: string, callback: Callback): void {
        if (!this.guildOnDisconnects.has(guildId)) {
            this.guildOnDisconnects.set(guildId, []);
        }
        this.guildOnDisconnects.set(guildId, [...this.guildOnDisconnects.get(guildId), callback]);
    }
}

@scoped(Lifecycle.ResolutionScoped)
export class GuildScopedVoiceConnectionService {
    constructor(
        @inject(VoiceConnectionService) private readonly voiceConnectionService: VoiceConnectionService,
        @inject("GuildId") private readonly guildId: string
    ) {}

    public getConnection(): ActivityTrackingVoiceConnection {
        return this.voiceConnectionService.getConnectionForGuild(this.guildId);
    }

    public getOrCreateConnection(
        channelToUseIfNotInExisting: VoiceChannel | StageChannel
    ): Promise<ActivityTrackingVoiceConnection> {
        return this.voiceConnectionService.getOrCreateConnectionForGuild(this.guildId, channelToUseIfNotInExisting);
    }

    public disconnect(): void {
        this.voiceConnectionService.disconnect(this.guildId);
    }

    public subscribeToDisconnect(callback: Callback): void {
        this.voiceConnectionService.subscribeToDisconnect(this.guildId, callback);
    }
}
