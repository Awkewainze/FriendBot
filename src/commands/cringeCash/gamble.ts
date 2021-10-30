import { Message } from "discord.js";
import { inject, Lifecycle, scoped } from "tsyringe";
import CringeCashService from "../../services/cringeCashService";
import { Command } from "../command";

/**
 * Add balance
 * @category Command
 */
@scoped(Lifecycle.ResolutionScoped, "xCommand")
export class GambleCommand extends Command {
    constructor(@inject(CringeCashService) private readonly cringeCashService: CringeCashService) {
        super();
    }

    /** Triggered by `$cringe gamble (amount)`. */
    async check(message: Message): Promise<boolean> {
        return /^\$cringe pay \d+?$/i.test(message.content.trim()) && message.member.id === "181223459202924556";
    }

    async execute(message: Message): Promise<void> {
        const amount = /^\$cringe pay (?<balance>-?\d+(\.\d+)?)$/i.exec(message.content.trim()).groups.balance;
        const newBalance = await this.cringeCashService.makeTransaction(
            message.guild.id,
            message.member.id,
            parseFloat(amount)
        );
        message.reply(`New balance: ${newBalance}cc`);
    }
}
