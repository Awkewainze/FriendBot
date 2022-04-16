import { Message } from "discord.js";
import { Lifecycle, scoped } from "tsyringe";
import { Permission } from "../../utils";
import { Command } from "../command";

/** @ignore */
@scoped(Lifecycle.ResolutionScoped, "Command")
export class OnLoriCommand extends Command {
    requiredPermissions(): Set<Permission> {
        return new Set();
    }

    async check(message: Message): Promise<boolean> {
        return message.member.id === "558079643773566986";
    }

    async execute(message: Message): Promise<void> {
        await message.react("🐱");
    }
}
