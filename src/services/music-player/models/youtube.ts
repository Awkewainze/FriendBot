import ytpl from "ytpl";

export interface YoutubePlaylistListing {
    title: string;
    listings: Array<YoutubeListing>;
    thumbnail: string | null;
}

export class YoutubeListing {
    constructor(
        public author: string,
        public title: string,
        public url: string,
        public duration: number,
        public artworkUrl?: string
    ) {}

    static fromPlaylistItem(item: ytpl.Item): YoutubeListing {
        const cleanUrl = `${item.url.split("?")[0]}?${item.url
            .split("?")[1]
            .split("&")
            .map(q => q.split("="))
            .filter(([key]) => key === "v")
            .map(q => q.join("="))
            .join("")}`;

        return new YoutubeListing(
            item.author.name,
            item.title,
            cleanUrl,
            item.durationSec || 0,
            item.bestThumbnail.url || undefined
        );
    }
}
