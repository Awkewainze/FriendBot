import * as fs from "fs";
import * as path from "path";
import { ClientOpts } from "redis";
let config: Config;
try {
    if (fs.existsSync(path.join(__dirname, "..", "config.json"))) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        config = require("../config.json");
    } else {
        config = {
            DISCORD: {
                LOGIN_TOKEN: process.env["DISCORD_LOGIN_TOKEN"]
            },
            REDIS: {
                url: process.env["REDIS_URL"]
            }
        };
    }
} catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
}

export const CONFIG: Config = config;

export declare type Config = {
    DISCORD: {
        LOGIN_TOKEN: string;
    };
    REDIS: ClientOpts;
};
