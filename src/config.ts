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
    PLEX: {
        Identifier: string;
        Login: string;
        Password: string;
        Uri: string;
        Root: string;
        Transforms: Array<{ type: "replace"; from: string; to: string }>;
    };
};
