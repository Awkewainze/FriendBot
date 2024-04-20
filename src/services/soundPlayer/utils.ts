import { AudioResource, createAudioResource } from "@discordjs/voice";
import { SoundInfo } from "./soundQueue";

export class Utils {
    static toAudioResource(sound: SoundInfo): AudioResource {
        return createAudioResource(sound.id);
    }
}