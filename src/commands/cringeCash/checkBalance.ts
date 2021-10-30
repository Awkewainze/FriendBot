import { Message } from "discord.js";
import { inject, Lifecycle, scoped } from "tsyringe";
import CringeCashService from "../../services/cringeCashService";
import { Permission } from "../../utils";
import { Command } from "../command";

/**
 * Check your balance
 * @category Command
 */
@scoped(Lifecycle.ResolutionScoped, "Command")
export class CheckBalanceCommand extends Command {
    constructor(@inject(CringeCashService) private readonly cringeCashService: CringeCashService) {
        super();
    }

    requiredPermissions(): Set<Permission> {
        return new Set([Permission.UseCommands, Permission.CringeCash]);
    }

    /** Triggered by `$cringe balance`. */
    async check(message: Message): Promise<boolean> {
        return /^\$cringe balance$/i.test(message.content.trim());
    }

    async execute(message: Message): Promise<void> {
        const balance = await this.cringeCashService.getBalance(message.guild.id, message.member.id);
        message.reply(`Balance: \`${balance}cc\``);
    }
}
