/* eslint-disable max-len */
import { GuildMember } from "discord.js";
import { container } from "tsyringe";
import winston from "winston";

export async function OnGuildMemberRemove(member: GuildMember): Promise<void> {
    container.resolve<winston.Logger>("Logger").info({
        message: `User left - ${member.user.username}`,
        event: "UserLeft",
        user: {
            id: member.user.id,
            username: member.user.username
        }
    });
}
