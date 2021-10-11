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

        this.logger.info("oh boy here we go!");
        this.configureTables();
        this.test();
    }

    private async configureTables() {
        this.logger.debug("Setting up tables.");
        const db = await this.databaseService.getDatabase();
        await db.run(`
            CREATE TABLE IF NOT EXISTS cashBalance (
                discordId TEXT UNIQUE,
                balance INT
            )
        `);
    }

    async test(): Promise<void> {
        this.logger.info("Giving this a test.");
        const balance = await this.changeBalance("12345", 100);

        this.logger.info("New balance: " + balance);

        const secondBalance = await this.changeBalance("12345", -100);

        this.logger.info("Newer balance: " + secondBalance);

        const newPerson = await this.changeBalance("1234567", 200);

        this.logger.info("Newest: " + newPerson);
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
            // TODO throw error, prevent negative balances
            return;
        }

        await this.databaseService.query(
            "UPDATE cashBalance SET balance = ? WHERE discordId = ?",
            String(newBalance),
            userId
        );

        return this.getBalance(userId);
    }
}
