import bytes from "bytes";
import { DateTime } from "luxon";
import { onShutdown } from "node-graceful-shutdown";
import { v4 as uuidv4 } from "uuid";
import winston, { createLogger, transports } from "winston";

// Logger configuration
const { combine, timestamp, colorize, printf, json, splat } = winston.format;

const consoleLogFormat = printf(({ level, message, timestamp, src }) => {
    const readableDate = DateTime.fromISO(timestamp).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
    return `<${level}> [${src}] (${readableDate}) ${message}`;
});

const addDefaultSrc = winston.format(info => {
    info.src = info.src ?? "Default";
    return info;
});

const debugOnly = winston.format(info => (info.level === "debug" ? info : false));

const id = winston.format(info => {
    info.id = uuidv4();
    return info;
});

const debugConsoleEnabled = process.argv.includes("-debug");
const logger = createLogger({
    level: "info",
    format: combine(addDefaultSrc(), splat(), timestamp(), id(), json()),
    transports: [
        new transports.File({ filename: "logs/error.log", level: "error", maxsize: bytes("10mb") }),
        new transports.File({ filename: "logs/info.log", level: "info", maxsize: bytes("10mb") }),
        new transports.File({
            format: combine(debugOnly()),
            filename: "logs/debug-only.log",
            level: "debug",
            maxsize: bytes("10mb")
        }),
        new transports.Console({
            format: combine(colorize(), timestamp(), splat(), consoleLogFormat),
            level: debugConsoleEnabled ? "debug" : "info"
        })
    ],
    exceptionHandlers: [new transports.File({ filename: "logs/exceptions.log" })]
});

onShutdown("Log Shutdown", async () => {
    logger.info("Shutting down server");
});
if (debugConsoleEnabled) {
    logger.debug("Debug console enabled");
}

export const Logger = logger;
