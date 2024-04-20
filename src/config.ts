import { Duration } from "@awkewainze/simpleduration";
import * as fs from "fs";
import path from "path";
import { ClientOpts } from "redis";
import { container } from "tsyringe";
import winston from "winston";
import { PlexConfig } from "./plex";
let config: Config;
try {
    if (fs.existsSync(path.join(__dirname, "..", "config.json"))) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        config = require("../config.json");
    } else {
        config = {
            DISCORD: {
                AUTO_DISCONNECT_TIME_MS: Duration.fromMinutes(10).toMilliseconds(),
                LOGIN_TOKEN: null
            },
            REDIS: {},
            PLEX: {},
            YOUTUBE: {
                SHOULD_CACHE: false,
                LOCAL_CACHE_LOCATION: "./yt-cache/"
            }
        };
    }

    config.DISCORD.LOGIN_TOKEN = process.env.DISCORD_LOGIN_TOKEN ?? config.DISCORD.LOGIN_TOKEN;
    config.REDIS.url = process.env.REDIS_HOST ?? config.REDIS.url;
} catch (err) {
    container.resolve<winston.Logger>("Logger").error(err);
}

export const CONFIG: Config = config;

export declare type Config = {
    DISCORD: {
        AUTO_DISCONNECT_TIME_MS: number;
        LOGIN_TOKEN: string;
    };
    REDIS: ClientOpts;
    PLEX?: Partial<PlexConfig>;
    YOUTUBE: {
        SHOULD_CACHE: boolean;
        LOCAL_CACHE_LOCATION: string;
    }
};
