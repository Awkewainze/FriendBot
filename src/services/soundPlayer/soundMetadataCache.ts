import { Check } from "@awkewainze/checkverify";
import { inject, singleton } from "tsyringe";
import { getInfo } from "ytdl-core";
import { CachingService } from "../cachingService";

export interface SoundMetadata {
    id: string;
    title: string;
    source: "youtube" | "fileUrl" | "local";
    url: string;
    imageUrl: string;
    duration: number;
}

@singleton()
export class SoundMetadataCache {
    constructor(
        @inject("CachingService") private readonly cachingService: CachingService
    ) { }

    async getMetadata(source: "youtube" | "local", id: string): Promise<SoundMetadata> {
        Check.verify(source === "local" || source === "youtube", "source must be 'youtube' or 'local'");
        const key = `${source}/${id}`;
        if (await this.cachingService.exists(key)) {
            return await this.cachingService.get(key);
        }

        getInfo(`https://www.youtube.com/watch?v=${id}`);
    }
}
