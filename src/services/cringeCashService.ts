import { Check } from "@awkewainze/checkverify";
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
     * @param {string} guildId
     * @param {string} userId
     * @returns {Promise<number>} - the user's balance
     */
    getBalance(guildId: string, userId: string): Promise<number> {
        return this.getBalanceRecord(guildId, userId).then(result => {
            if (Check.isNullOrUndefined(result)) {
                return this.createAccount(guildId, userId);
            }

            return Number(result.balance);
        });
    }

    /**
     * Sets the user's balance
     * @param userId
     * @param balance
     */
    async setBalance(guildId: string, userId: string, balance: number): Promise<void> {
        Check.verifyNotNegative(balance);
        if (this.hasAccount(guildId, userId)) {
            await this.databaseService.query(
                "UPDATE cashBalance SET balance=? WHERE guildId=? AND discordId=?",
                String(balance),
                guildId,
                userId
            );
        } else {
            await this.createAccount(guildId, userId, balance);
        }
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
    async createAccount(guildId: string, userId: string, initialBalance = 0): Promise<number> {
        Check.verify(
            !(await this.hasAccount(guildId, userId)),
            `User '${userId}' already has a cringeCash account, cannot recreate.`
        );

        if (initialBalance < 0) {
            initialBalance = 0;
        }

        initialBalance = Math.floor(initialBalance);

        await this.databaseService.insert(
            "INSERT INTO cashBalance (guildId, discordId, balance) VALUES (?, ?, ?)",
            guildId,
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
    async makeTransaction(guildId: string, userId: string, difference: number): Promise<number> {
        const balance = await this.getBalance(guildId, userId);
        const amountRounded = Math.floor(difference);

        if (amountRounded === 0) {
            return balance;
        }

        const newBalance = balance + amountRounded;
        Check.verifyNotNegative(newBalance);

        await this.setBalance(guildId, userId, newBalance);
        return newBalance;
    }

    /**
     * Checks if a given user id already has an account.
     *
     * @param userId
     * @returns Promise<boolean> - true if the user has an account, false otherwise.
     */
    async hasAccount(guildId: string, userId: string): Promise<boolean> {
        return (await this.getBalanceRecord(guildId, userId)) !== null;
    }

    /**
     * Retrieves a balance record for a given user, or null if nonexistent.
     *
     * @private
     * @param userId
     * @returns Promise<RawBalance|null>
     */
    private getBalanceRecord(guildId: string, userId: string): Promise<RawBalance | null> {
        return this.databaseService
            .get<RawBalance>("SELECT * FROM cashBalance WHERE guildId=? AND discordId=?", guildId, userId)
            .then(result => (!result ? null : result));
    }
}
