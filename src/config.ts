import { ClientOpts } from "redis";
import { container } from "tsyringe";
import winston from "winston";
import * as dotenv from "dotenv";
import { createPlexConfig } from "./plex";
import { PlexConfig } from "./plex";
import path from "path";
import * as fs from "fs";
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

    let jsonConfig: Partial<Config>;
    if (fs.existsSync(path.join(__dirname, "..", "config.json"))) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        jsonConfig = require("../config.json");
    } else {
        jsonConfig = {};
    }

    if (process.env.PLEX_ENABLED) {
        config.PLEX = createPlexConfig(jsonConfig);
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
