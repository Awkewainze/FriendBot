import { Check } from "@awkewainze/checkverify";
import Timezones from "timezones-list";
import { inject, singleton } from "tsyringe";
import winston from "winston";
import { DatabaseService } from "./databaseService";

interface TimeZone {
    label: string;
    tzCode: string;
    name: string;
    utc: string;
}

@singleton()
export class TimeZoneService {
    constructor(
        @inject(DatabaseService) private readonly databaseService: DatabaseService,
        @inject("Logger") private readonly logger: winston.Logger
    ) {
        this.logger = this.logger.child({ src: this.constructor.name });
    }

    async getUsersTimeZone(userId: string): Promise<TimeZone | undefined> {
        const row = await this.databaseService.get<{ discordId: string; timeZone: string }>(
            "SELECT * FROM userTimeZones WHERE discordId=?;",
            userId
        );
        return Timezones.find(x => x.tzCode === row?.timeZone);
    }

    async setUserTimeZone(userId: string, tzCode: string): Promise<void> {
        Check.verifyNotNullOrUndefined(TimeZoneService.findTimeZone(tzCode), "Provided timezone is invalid");

        const currentTimezone = await this.getUsersTimeZone(userId);
        if (currentTimezone) {
            await this.databaseService.query("UPDATE userTimeZones SET timeZone=? WHERE discordId=?", tzCode, userId);
        } else {
            await this.databaseService.insert(
                "INSERT INTO userTimeZones (discordId, timeZone) VALUES (?, ?)",
                userId,
                tzCode
            );
        }
    }

    static listTimeZones(): Array<TimeZone> {
        return Timezones;
    }

    static listTimeZoneCodes(): Array<string> {
        return Timezones.map(x => x.tzCode);
    }

    static findTimeZone(tzCode: string): TimeZone | undefined {
        return Timezones.find(x => x.tzCode.toLowerCase() === tzCode.toLowerCase());
    }
}
