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
        @inject(DatabaseService) private readonly databaseService: DatabaseService,
        @inject("Logger") private readonly logger: winston.Logger
    ) {
        this.logger = this.logger.child({ src: "CringeCashService" });
    }

    /**
     * Retrieves a user's balance.
     * If the user does not have a balance yet, will create one for them (set at 0).
     *
     * @param {string} userId
     * @returns {Promise<number>} - the user's balance
     */
    getBalance(userId: string): Promise<number> {
        return this.getBalanceRecord(userId).then(result => {
            if (!result) {
                return this.createAccount(userId);
            }

            return Number(result.balance);
        });
    }

    /**
     * Creates a new account for a given user id.
     * If you want to create a user if they don't exist, use getBalance or makeTransaction.
     * If the user already exists, this will throw an error.
     *
     * @param {string} userId
     * @param {number} initialBalance - the balance to set the user at
     * @returns {Promise<number>} - the user's balance after creation
     */
    async createAccount(userId: string, initialBalance = 0): Promise<number> {
        if (await this.hasAccount(userId)) {
            throw new Error(`User '${userId}' already has a cringeCash account, cannot recreate.`);
        }

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

    /**
     * Makes a transaction for a given user.
     * If the difference is a decimal, it will be floored to the integer below it.
     * If the difference is positive, will add balance - if it's negative, will subtract balance.
     * If the user's resulting balance would be null, will throw an error.
     *
     * @param {string} userId
     * @param {number} difference
     * @returns {Promise<number>} - the balance after the transaction has completed
     */
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

    /**
     * Checks if a given user id already has an account.
     *
     * @param userId
     * @returns Promise<boolean> - true if the user has an account, false otherwise.
     */
    async hasAccount(userId: string): Promise<boolean> {
        return (await this.getBalanceRecord(userId)) !== null;
    }

    /**
     * Retrieves a balance record for a given user, or null if nonexistent.
     *
     * @private
     * @param userId
     * @returns Promise<RawBalance|null>
     */
    private getBalanceRecord(userId: string): Promise<RawBalance | null> {
        return this.databaseService
            .get<RawBalance>("SELECT * FROM cashBalance WHERE discordId = ?", userId)
            .then(result => (!result ? null : result));
    }
}
