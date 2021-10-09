import { ClientOpts } from "redis";
import { container } from "tsyringe";
import winston from "winston";
import * as dotenv from "dotenv";
import { createPlexConfig } from "./plex";
import { PlexConfig } from "./plex";
let config: Config;
try {
    dotenv.config();
    config = {
        DISCORD: {
            LOGIN_TOKEN: process.env.DISCORD_LOGIN_TOKEN
        },
        REDIS: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            db: process.env.REDIS_DB
        }
    };

    if (process.env.PLEX_ENABLED) {
        config.PLEX = createPlexConfig();
    } else {
        config.PLEX = {};
    }
} catch (err) {
    container.resolve<winston.Logger>("Logger").error(err);
}

export const CONFIG: Config = config;

export declare type Config = {
    DISCORD: {
        LOGIN_TOKEN: string;
    };
    REDIS: ClientOpts;
    PLEX?: Partial<PlexConfig>;
};
