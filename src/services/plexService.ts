import axios, { AxiosInstance } from "axios";
import path from "path";
import { inject, singleton } from "tsyringe";
import winston from "winston";
import { CONFIG } from "../config";
import { PersistentCachingService } from "./cachingService";

const PlexHeaders = {
    "X-Plex-Client-Identifier": CONFIG.PLEX.Identifier,
    "X-Plex-Product": "Friendbot",
    "X-Plex-Version": "1.0.0",
    Accept: "application/json"
};

@singleton()
export class PlexService {
    private axiosClient: AxiosInstance;
    public constructor(
        @inject("PersistentCachingService")
        private readonly persistentCachingService: PersistentCachingService,
        @inject("Logger") private readonly logger: winston.Logger
    ) {
        this.logger = this.logger.child({ src: this.constructor.name });
    }

    private static readonly TokenCacheId = "plex-auth-token";
    private authToken: string;
    public async attemptLogin(forceRefresh = false): Promise<void> {
        if (forceRefresh || !(await this.persistentCachingService.exists(PlexService.TokenCacheId))) {
            this.authToken = await this.login();
            this.persistentCachingService.set(PlexService.TokenCacheId, this.authToken);
        } else {
            this.authToken = await this.persistentCachingService.get(PlexService.TokenCacheId);
        }

        const headers = { "X-Plex-Token": this.authToken };
        Object.assign(headers, PlexHeaders);

        this.axiosClient = axios.create({
            baseURL: CONFIG.PLEX.Uri,
            headers
        });
    }

    /** Returns list of paths. This is very specific to my Plex server, need to make more generic. */
    public async getGwentSongs(): Promise<Array<string>> {
        try {
            await this.attemptLogin();
            const response = await this.axiosClient.get<PlaylistDetailsContainer>("/library/sections/3/all", {
                params: {
                    type: 10,
                    mood: 1688
                }
            });
            return response.data.MediaContainer.Metadata.map(meta => {
                let uri = path.join(CONFIG.PLEX.Root, meta.Media[0].Part[0].file);
                CONFIG.PLEX.Transforms.forEach(x => {
                    if (x.type === "replace") {
                        uri = uri.replace(x.from, x.to);
                    }
                });
                return uri;
            });
        } catch (e) {
            this.logger.error(e);
        }
    }

    /** Returns token */
    private async login(): Promise<string> {
        try {
            const response = await axios.post<{ authToken: string }>(
                "https://plex.tv/api/v2/users/signin",
                {
                    login: CONFIG.PLEX.Login,
                    password: CONFIG.PLEX.Password
                },
                {
                    headers: PlexHeaders
                }
            );
            return response.data.authToken;
        } catch (e) {
            this.logger.error(e);
        }
    }
}
