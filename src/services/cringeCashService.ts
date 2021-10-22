import { inject, singleton } from "tsyringe";
import winston from "winston";
import { DatabaseService } from "./databaseService";

type RawBalance = {
    discordId: string;
    balance: string;
};

@singleton()
export default class CringeCashService {
    constructor(
        @inject("DatabaseService") private readonly databaseService: DatabaseService,
        @inject("Logger") private readonly logger: winston.Logger
    ) {
        this.logger = this.logger.child({ src: "CringeCashService" });
    }

    getBalance(userId: string): Promise<number> {
        return this.databaseService
            .get<RawBalance>("SELECT * FROM cashBalance WHERE discordId = ?", userId)
            .then(result => {
                if (!result) {
                    return this.createAccount(userId);
                }

                return Number(result.balance);
            });
    }

    async createAccount(userId: string, initialBalance = 0): Promise<number> {
        if (initialBalance < 0) {
            initialBalance = 0;
        }

        initialBalance = Math.floor(initialBalance);

        await this.databaseService.insert(
            "INSERT INTO cashBalance (discordId, balance) VALUES (?, ?)",
            userId,
            initialBalance.toString()
        );
        return initialBalance;
    }

    async makeTransaction(userId: string, difference: number): Promise<number> {
        const balance = await this.getBalance(userId);
        const amountRounded = Math.floor(difference);

        if (amountRounded === 0) {
            return balance;
        }

        const newBalance = balance + amountRounded;

        if (newBalance < 0) {
            throw new Error(
                `Cannot change balance - user ${userId} created a new balance of ${newBalance}, which is negative.`
            );
        }

        await this.databaseService.query(
            "UPDATE cashBalance SET balance = ? WHERE discordId = ?",
            String(newBalance),
            userId
        );

        return this.getBalance(userId);
    }
}
