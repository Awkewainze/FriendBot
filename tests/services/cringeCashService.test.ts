import { TestLogger } from "../testLogger";
import CringeCashService from "../../src/services/cringeCashService";
import MockDatabaseService from "../mocks/mockDatabaseService";
import faker from "faker";
import { CringeCashMigration } from "../../src/boot/sqlite";

const mockDatabaseService = new MockDatabaseService();
const regenerateUserId = (): string => Math.abs(Math.round(faker.datatype.number())).toString();
const instantiate = () => new CringeCashService(mockDatabaseService, TestLogger);

let userId = regenerateUserId();
let service = instantiate();

beforeAll(async () => {
    const db = await mockDatabaseService.getDatabase();
    await new CringeCashMigration().run(db);
});

beforeEach(async () => {
    const db = await mockDatabaseService.getDatabase();
    await db.run("DELETE FROM cashBalance;");
    userId = regenerateUserId();
    service = instantiate();
});

afterAll(async () => {
    const db = await mockDatabaseService.getDatabase();
    await db.close();
});

describe("cringeCashService", () => {
    it("should create an empty balance for a new user", async () => {
        const result = await instantiate().getBalance(userId);
        expect(result).toEqual(0);
    });

    it("should not accept decimal amounts for initial balance", async () => {
        const result = await instantiate().createAccount(userId, 123.1234123);
        expect(result).toEqual(123);
    });

    it("should not accept negative balances for initial balance", async () => {
        const result = await instantiate().createAccount(userId, -12345);
        expect(result).toEqual(0);
    });

    it("should create a balance with an initial amount if specified", async () => {
        const service = instantiate();
        let balance = Math.abs(Math.round(faker.datatype.number()));
        await service.createAccount(userId, balance);
        const result = await instantiate().getBalance(userId);
        expect(result).toEqual(balance);
    });

    it("should not allow a user to be created twice", async () => {
        const service = instantiate();
        await service.createAccount(userId);
        await expect(service.createAccount(userId)).rejects.toThrowError();
    });

    it("should allow transactions (adding and subtracting)", async () => {
        const service = instantiate();
        const firstTransaction = 100;
        const secondTransaction = -50;

        expect(await service.makeTransaction(userId, firstTransaction)).toEqual(100);
        expect(await service.makeTransaction(userId, secondTransaction)).toEqual(50);
    });

    it("should return balance if a user has one", async () => {
        const service = instantiate();
        await service.createAccount(userId, 1200);
        await service.makeTransaction(userId, 200);
        expect(await service.getBalance(userId)).toEqual(1400);
    });

    it("should not allow a negative balance after a transaction", () => {
        expect(instantiate().makeTransaction(userId, -100)).rejects.toThrowError();
    });
});
