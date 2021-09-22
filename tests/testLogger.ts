import { createLogger, transports } from "winston";

export const TestLogger = createLogger({
    silent: true,
    level: "info",
    transports: [
        new transports.Console()
    ]
});