// https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
import { Message } from "discord.js";
import { inject, injectable, Lifecycle, scoped } from "tsyringe";
import { TimeZoneService } from "../../services";
import { Permission } from "../../utils";
import { Command } from "../command";

/**
 * Set your timezone
 * @category Command
 */
@injectable()
@scoped(Lifecycle.ResolutionScoped, "Command")
export class SetTimeZoneCommand extends Command {
    constructor(@inject(TimeZoneService) private readonly timeZoneService: TimeZoneService) {
        super();
    }

    requiredPermissions(): Set<Permission> {
        return new Set([Permission.UseCommands, Permission.ModifySelf]);
    }

    /** Triggered by `$tz <timezone code>`. i.e. `$tz America/Chicago` */
    async check(message: Message): Promise<boolean> {
        return /^\$tz .+/i.test(message.content.trim());
    }

    async execute(message: Message): Promise<void> {
        const rawTz = /^\$tz (?<timezone>.+)/i.exec(message.content.trim()).groups.timezone;
        const tzObj = TimeZoneService.findTimeZone(rawTz);
        if (!tzObj) {
            const url = "https://en.wikipedia.org/wiki/List_of_tz_database_time_zones";
            await message.reply(
                `Provided timezone is invalid. Check ${url} for list of valid time zone codes, i.e. \`America/Chicago\``
            );
            return;
        }
        await this.timeZoneService.setUserTimeZone(message.member.id, tzObj.tzCode);
        await message.reply(`Time zone set to ${tzObj.tzCode}!`);
    }
}
