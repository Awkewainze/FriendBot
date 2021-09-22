import * as fs from "fs";
import * as path from "path";
import { ClientOpts } from "redis";
import { container } from "tsyringe";
import winston from "winston";
let config: Config;
try {
    if (fs.existsSync(path.join(__dirname, "..", "config.json"))) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        config = require("../config.json");
    } else if (process.env["DISCORD_LOGIN_TOKEN"] !== undefined && process.env["REDIS_URL"]) {
        config = {
            DISCORD: {
                LOGIN_TOKEN: process.env["DISCORD_LOGIN_TOKEN"]
            },
            REDIS: {
                url: process.env["REDIS_URL"]
            }
        };
    } else {
        throw new Error("Missing config information");
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
};
