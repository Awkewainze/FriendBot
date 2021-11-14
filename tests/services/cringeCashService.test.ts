import { CringeCashMigration } from "../../src/boot/sqlite";
import CringeCashService from "../../src/services/cringeCashService";
import MockDatabaseService from "../mocks/mockDatabaseService";
import { TestLogger } from "../testLogger";

const mockDatabaseService = new MockDatabaseService();
const instantiate = () => new CringeCashService(mockDatabaseService, TestLogger);

let guildId = "testGuildId";
let userId = "testUserId";
let service = instantiate();

beforeAll(async () => {
    const db = await mockDatabaseService.getDatabase();
    await new CringeCashMigration().run(db);
});

beforeEach(async () => {
    const db = await mockDatabaseService.getDatabase();
    await db.run("DELETE FROM cashBalance;");
    userId = userId;
    service = instantiate();
});

afterAll(async () => {
    const db = await mockDatabaseService.getDatabase();
    await db.close();
});

describe("cringeCashService", () => {
    it("should create an empty balance for a new user", async () => {
        const result = await instantiate().getBalance(guildId, userId);
        expect(result).toEqual(0);
    });

    it("should not accept decimal amounts for initial balance", async () => {
        const result = await instantiate().createAccount(guildId, userId, 123.1234123);
        expect(result).toEqual(123);
    });

    it("should not accept negative balances for initial balance", async () => {
        const result = await instantiate().createAccount(guildId, userId, -12345);
        expect(result).toEqual(0);
    });

    it("should create a balance with an initial amount if specified", async () => {
        const service = instantiate();
        let balance = 15;
        await service.createAccount(guildId, userId, balance);
        const result = await instantiate().getBalance(guildId, userId);
        expect(result).toEqual(balance);
    });

    it("should not allow a user to be created twice", async () => {
        const service = instantiate();
        await service.createAccount(guildId, userId);
        await expect(service.createAccount(guildId, userId)).rejects.toThrowError();
    });

    it("should properly determine if a user has an account already", async () => {
        const service = instantiate();
        await service.createAccount(guildId, userId);
        await expect(service.hasAccount(guildId, userId)).toBeTruthy();
    });

    it("should allow transactions (adding and subtracting)", async () => {
        const service = instantiate();
        const firstTransaction = 100;
        const secondTransaction = -50;

        expect(await service.makeTransaction(guildId, userId, firstTransaction)).toEqual(100);
        expect(await service.makeTransaction(guildId, userId, secondTransaction)).toEqual(50);
    });

    it("should return balance if a user has one", async () => {
        const service = instantiate();
        await service.createAccount(guildId, userId, 1200);
        await service.makeTransaction(guildId, userId, 200);
        expect(await service.getBalance(guildId, userId)).toEqual(1400);
    });

    it("should not allow a negative balance after a transaction", () => {
        expect(instantiate().makeTransaction(guildId, userId, -100)).rejects.toThrowError();
    });
});
