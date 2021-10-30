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
export class AddBalanceCommand extends Command {
    constructor(@inject(CringeCashService) private readonly cringeCashService: CringeCashService) {
        super();
    }

    requiredPermissions(): Set<Permission> {
        return new Set([Permission.UseCommands, Permission.CringeCashAdmin]);
    }

    /** Triggered by `$cringe-admin add [mention] <amount>`. */
    async check(message: Message): Promise<boolean> {
        return /^\$cringe-admin add( .+)?-?\d+?$/i.test(message.content.trim());
    }

    async execute(message: Message): Promise<void> {
        const amount = /^\$cringe-admin add( .+) (?<amount>-?\d+)?)$/i.exec(message.content.trim()).groups.amount;
        if (message.mentions.members.entries.length > 0) {
            for (const member of message.mentions.members.values()) {
                await this.cringeCashService.makeTransaction(message.guild.id, member.id, Number(amount));
            }
        } else {
            const newBalance = await this.cringeCashService.makeTransaction(
                message.guild.id,
                message.member.id,
                Number(amount)
            );
            message.reply(`New balance: \`${newBalance}cc\``);
        }
    }
}
