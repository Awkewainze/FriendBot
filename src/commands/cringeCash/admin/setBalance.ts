import { Message } from "discord.js";
import { inject, Lifecycle, scoped } from "tsyringe";
import CringeCashService from "../../../services/cringeCashService";
import { Permission } from "../../../utils";
import { Command } from "../../command";

/**
 * Add balance
 * @category Command
 */
@scoped(Lifecycle.ResolutionScoped, "Command")
export class SetBalanceCommand extends Command {
    constructor(@inject(CringeCashService) private readonly cringeCashService: CringeCashService) {
        super();
    }

    requiredPermissions(): Set<Permission> {
        return new Set([Permission.UseCommands, Permission.CringeCashAdmin]);
    }

    /** Triggered by `$cringe-admin add (amount)`. */
    async check(message: Message): Promise<boolean> {
        return /^\$cringe-admin set( .+)? -?\d+?$/i.test(message.content.trim());
    }

    async execute(message: Message): Promise<void> {
        const amount = /^\$cringe-admin set( .+)? (?<balance>-?\d+?)$/i.exec(message.content.trim()).groups.balance;
        await this.cringeCashService.setBalance(message.guild.id, message.member.id, Number(amount));
        message.reply(`New balance: \`${amount}cc\``);
    }
}
