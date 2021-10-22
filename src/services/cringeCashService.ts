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

        this.configureTables();
    }

    private async configureTables() {
        const db = await this.databaseService.getDatabase();
        await db.run(`
            CREATE TABLE IF NOT EXISTS cashBalance (
                discordId TEXT UNIQUE,
                balance INT
            )
        `);
    }

    getBalance(userId: string): Promise<number | null> {
        return this.databaseService
            .get<RawBalance>("SELECT * FROM cashBalance WHERE discordId = ?", userId)
            .then(result => {
                if (!result) {
                    return null;
                }

                return Number(result.balance);
            });
    }

    async createAccount(userId: string): Promise<void> {
        await this.databaseService.insert("INSERT INTO cashBalance (discordId, balance) VALUES (?, ?)", userId, "0");
    }

    async upsertBalance(userId: string): Promise<number> {
        const balance = await this.getBalance(userId);

        if (!balance) {
            await this.createAccount(userId);
            return 0;
        }

        return balance;
    }

    async changeBalance(userId: string, difference: number): Promise<number> {
        const balance = await this.upsertBalance(userId);
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
