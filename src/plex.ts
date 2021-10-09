import { Config } from "./config";

export type PlexConfig = {
    Identifier: string;
    Login: string;
    Password: string;
    Uri: string;
    Root: string;
    Transforms: Array<{ type: "replace"; from: string; to: string }>;
};

export const createPlexConfig = (config: Partial<Config>): PlexConfig => ({
    Identifier: process.env.PLEX_IDENTIFIER,
    Login: process.env.PLEX_LOGIN,
    Password: process.env.PLEX_PASSWORD,
    Uri: process.env.PLEX_URI,
    Root: process.env.PLEX_ROOT,
    Transforms: [],
    ...config.PLEX
});
