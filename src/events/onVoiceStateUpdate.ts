import { VoiceState } from "discord.js";
import { container } from "tsyringe";
import { UserConnectionTrackingService } from "../services";
import { Check } from "../utils";

export async function OnVoiceStateUpdate(oldState: VoiceState, newState: VoiceState): Promise<void> {
    if (oldState.channelID !== newState.channelID) {
        const userConnectionTrackingService: UserConnectionTrackingService = container.resolve(
            UserConnectionTrackingService
        );
        if (Check.isNotNull(oldState.channelID)) {
            userConnectionTrackingService.userLeft(oldState.channelID, oldState.member);
        }
        if (Check.isNotNull(newState.channelID)) {
            userConnectionTrackingService.userJoined(newState.channelID, newState.member);
        }
    }
}
