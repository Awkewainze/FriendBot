import { Message } from "discord.js";
import { inject, Lifecycle, scoped } from "tsyringe";
import CringeCashService from "../../services/cringeCashService";
import { Command } from "../command";

/**
 * Send some of your hard earned cringe to someone else
 * @category Command
 */
@scoped(Lifecycle.ResolutionScoped, "Command")
export class SendCommand extends Command {
    constructor(@inject(CringeCashService) private readonly cringeCashService: CringeCashService) {
        super();
    }

    /** Triggered by `$cringe (send|pay) (mention) (amount)`. */
    async check(message: Message): Promise<boolean> {
        return /^\$cringe (send|pay) .+ \d+?$/i.test(message.content.trim()) && message.mentions.members.size > 0;
    }

    async execute(message: Message): Promise<void> {
        const amount = Number(/^\$cringe (send|pay) .+ (?<amount>\d+?)$/i.exec(message.content.trim()).groups.amount);
        await this.cringeCashService.makeTransaction(message.guild.id, message.member.id, 0 - amount);
        await this.cringeCashService.makeTransaction(message.guild.id, message.mentions.members.first().id, amount);
        message.reply(`You sent ${message.mentions.members.first().displayName} \`${amount}cc\`!`);
    }
}
