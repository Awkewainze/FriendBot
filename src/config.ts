import * as dotenv from "dotenv";
import * as fs from "fs";
import path from "path";
import { ClientOpts } from "redis";
import { container } from "tsyringe";
import winston from "winston";
import { PlexConfig } from "./plex";
let config: Config;
try {
    dotenv.config();
    if (fs.existsSync(path.join(__dirname, "..", "config.json"))) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        config = require("../config.json");
    } else {
        config = {
            DISCORD: {
                LOGIN_TOKEN: null
            },
            REDIS: {},
            PLEX: {}
        };
    }

    config.DISCORD.LOGIN_TOKEN = process.env.DISCORD_LOGIN_TOKEN ?? config.DISCORD.LOGIN_TOKEN;
    config.REDIS.host = process.env.REDIS_HOST ?? config.REDIS.host;
    config.REDIS.port = process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : config.REDIS.port;
    config.REDIS.db = process.env.REDIS_DB ?? config.REDIS.db;
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
