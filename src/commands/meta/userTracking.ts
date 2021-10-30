import { Message } from "discord.js";
import { container, Lifecycle, scoped } from "tsyringe";
import { UserActivity, UserConnectionTrackingService } from "../../services";
import { Permission } from "../../utils";
import { Command } from "../command";

/**
 * Gives simple tracking for who left and joined your channel.
 * @category Command
 */
@scoped(Lifecycle.ResolutionScoped, "Command")
export class UserTrackingCommand extends Command {
    requiredPermissions(): Set<Permission> {
        return new Set([Permission.UseCommands]);
    }
    /** Triggered by `$wholeft` or `$whojoined`. */
    async check(message: Message): Promise<boolean> {
        return /^\$(wholeft|whojoined|wl|wj)$/i.test(message.content);
    }
    /**  */
    async execute(message: Message): Promise<void> {
        const currentUserVoiceChannel = message?.member?.voice?.channel;
        if (!currentUserVoiceChannel) {
            message.channel.send("You must be in a voice channel to see activity");
            return;
        }
        const userConnectionTrackingService: UserConnectionTrackingService = container.resolve(
            UserConnectionTrackingService
        );

        let userActivities: Array<UserActivity> = [];
        if (/^\$(wholeft|wl)$/i.test(message.content)) {
            userActivities = userConnectionTrackingService.getWhoLeft(currentUserVoiceChannel.id);
            if (userActivities.length === 0) {
                await message.channel.send("No one has left recently");
                return;
            }
            await message.channel.send(
                userActivities
                    .map(
                        x =>
                            (x.member.nickname || x.member.user.username) +
                            " left " +
                            x.time.toRelative({ unit: "seconds" })
                    )
                    .join("\n")
            );
            return;
        }

        if (/^\$(whojoined|wj)$/i.test(message.content)) {
            userActivities = userConnectionTrackingService.getWhoJoined(currentUserVoiceChannel.id);
            if (userActivities.length === 0) {
                await message.channel.send("No one has joined recently");
                return;
            }
            await message.channel.send(
                userActivities
                    .map(
                        x =>
                            (x.member.nickname || x.member.user.username) +
                            " joined " +
                            x.time.toRelative({ unit: "seconds" })
                    )
                    .join("\n")
            );
            return;
        }
    }
}
