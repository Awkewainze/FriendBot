/* eslint-disable max-len */
import { GuildMember } from "discord.js";
import { container } from "tsyringe";
import winston from "winston";

export async function OnGuildMemberAdd(member: GuildMember): Promise<void> {
    container.resolve<winston.Logger>("Logger").info({
        message: `User joined - ${member.user.username}`,
        event: "UserJoined",
        user: {
            id: member.user.id,
            username: member.user.username
        }
    });
    await member.user.send(`😊 **Welcome to ${member.guild.name}!** 😊

**__Some quick things to do now that you're here!__**
    - Please make sure to read the #rules and set your #roles!
    - Make sure to check people's pronouns roles before referring to them, use they/them if you aren't sure.
        - You can see people's roles by either right-clicking on them and hovering over roles. Or by using the \`inspect @username\` command anywhere in the server.
    - If you're comfortable, introduce yourself in the #introductions channel and set your birthday in the #bot-commands channel!
    
❤️ **Thanks for joining!** ❤️`);
}
