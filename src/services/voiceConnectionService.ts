import { VoiceChannel } from "discord.js";
import { ActivityTrackingVoiceConnection, execute, Lazy } from "../utils";

/**
 * Manages mapping guild to it's respective voice connection.
 *
 * Singleton.
 * @category Service
 */
export class VoiceConnectionService {
    private guildConnectionMap: { [id: string]: ActivityTrackingVoiceConnection } = {};

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    private static lazyVoiceConnectionService: Lazy<VoiceConnectionService> = new Lazy(
        () => new VoiceConnectionService()
    );

    /** Gets the existing {@link VoiceConnectionService} or makes a new one. */
    public static getVoiceConnectionService(): VoiceConnectionService {
        return this.lazyVoiceConnectionService.get();
    }

    /**
     * Gets an existing voice connection.
     *
     * * Prefer using `getOrCreateConnectionForGuild` unless you want this to fail
     * * on attempt potentially, or if you know the connection exists.
     * @param guildId Guild id to lookup voice connection for.
     * @throws If connection does not exist.
     */
    public getConnectionForGuild(guildId: string): ActivityTrackingVoiceConnection {
        if (!this.guildConnectionMap[guildId]) {
            throw new Error("Not in any channels");
        }
        const connection = this.guildConnectionMap[guildId];
        return connection;
    }

    /** How many seconds of inactivity before the service closes the connection. */
    static readonly DisconnectAfterInactiveForSeconds: number = 300;

    /**
     * Gets or creates an existing voice channel.
     *
     * Will disconnect if inactive for {@link DisconnectAfterInactiveForSeconds} seconds.
     * @param guildId Guild id to lookup voice connection for.
     * @param channelToUseIfNotInExisting Channel to join if connection does not exist.
     */
    public async getOrCreateConnectionForGuild(
        guildId: string,
        channelToUseIfNotInExisting: VoiceChannel
    ): Promise<ActivityTrackingVoiceConnection> {
        if (!this.guildConnectionMap[guildId]) {
            this.guildConnectionMap[guildId] = ActivityTrackingVoiceConnection.wrapConnection(
                await channelToUseIfNotInExisting.join()
            ).whenInactiveForSeconds(VoiceConnectionService.DisconnectAfterInactiveForSeconds, self => {
                self.disconnect();
                delete this.guildConnectionMap[guildId];
            });
        }
        const connection = this.guildConnectionMap[guildId];
        return connection;
    }

    /**
     * Disconnect from voice in guild, if currently in a channel.
     * @param guildId Guild id of which guild to disconnect from if in a voice channel.
     */
    public disconnect(guildId: string): void {
        const connection = this.guildConnectionMap[guildId];
        if (connection) {
            connection.disconnect();
            (this.guildOnDisconnects[guildId] || []).forEach(execute);
            delete this.guildConnectionMap[guildId];
            delete this.guildOnDisconnects[guildId];
        }
    }

    private guildOnDisconnects: { [id: string]: Array<Callback> } = {};
    /**
     * Add a callback to be called when this service disconnects from a channel.
     * @param guildId Guild id of which guild to subscribe to.
     * @param callback Callback that will be called when voice channel is disconnected to.
     */
    public subscribeToDisconnect(guildId: string, callback: Callback): void {
        if (!this.guildOnDisconnects[guildId]) {
            this.guildOnDisconnects[guildId] = [];
        }
        this.guildOnDisconnects[guildId].push(callback);
    }
}
