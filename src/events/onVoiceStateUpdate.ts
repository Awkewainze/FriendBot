import { Check } from "@awkewainze/checkverify";
import { VoiceState } from "discord.js";
import { container } from "tsyringe";
import { UserConnectionTrackingService } from "../services";

export async function OnVoiceStateUpdate(oldState: VoiceState, newState: VoiceState): Promise<void> {
    if (oldState.channelId !== newState.channelId) {
        const userConnectionTrackingService: UserConnectionTrackingService = container.resolve(
            UserConnectionTrackingService
        );
        if (!Check.isNullOrUndefined(oldState.channelId)) {
            userConnectionTrackingService.userLeft(oldState.channelId, oldState.member);
        }
        if (!Check.isNullOrUndefined(newState.channelId)) {
            userConnectionTrackingService.userJoined(newState.channelId, newState.member);
        }
    }
}
