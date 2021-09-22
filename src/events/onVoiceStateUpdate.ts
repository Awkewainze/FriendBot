import { Check } from "@awkewainze/checkverify";
import { VoiceState } from "discord.js";
import { container } from "tsyringe";
import { UserConnectionTrackingService } from "../services";

export async function OnVoiceStateUpdate(oldState: VoiceState, newState: VoiceState): Promise<void> {
    if (oldState.channelID !== newState.channelID) {
        const userConnectionTrackingService: UserConnectionTrackingService = container.resolve(
            UserConnectionTrackingService
        );
        if (!Check.isNullOrUndefined(oldState.channelID)) {
            userConnectionTrackingService.userLeft(oldState.channelID, oldState.member);
        }
        if (!Check.isNullOrUndefined(newState.channelID)) {
            userConnectionTrackingService.userJoined(newState.channelID, newState.member);
        }
    }
}
