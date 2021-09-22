import { Message } from "discord.js";
import winston from "winston";
import { Command } from "../../src/commands/command";
import { CommandService } from "../../src/services/commandService";
import { noop } from "../../src/utils";

class MockCommand implements Command {
    public constructor(
        private readonly shouldCheck: boolean,
        private readonly onExecute: () => void,
        private readonly priorityCon: number,
        private readonly exclusiveCon: boolean
    ) { }
    async check(message: Message): Promise<boolean> {
        return this.shouldCheck;
    }
    async execute(message: Message): Promise<void> {
        this.onExecute();
    }
    priority(): number {
        return this.priorityCon;
    }
    exclusive(): boolean {
        return this.exclusiveCon;
    }
}

describe("commandService", () => {
    it("should order commands by priority", async () => {
        let hitFirst = false;
        const commandService = new CommandService([new MockCommand(
            true,
            () => {
                expect(hitFirst).toBe(true);
            },
            1,
            false
        ), new MockCommand(
            true,
            () => {
                hitFirst = true;
            },
            2,
            false
        )], winston.createLogger());
        const mockMessage = {
            author: {
                username: "Test"
            }
        };
        await commandService.execute(mockMessage as any);
    });
    it("should not run a command after exclusive command hit", async () => {
        const commandService = new CommandService([new MockCommand(
            true,
            () => {
                fail("should not reach run");
            },
            1,
            false
        ), new MockCommand(true, noop, 10, true)], winston.createLogger());
        const mockMessage = {
            author: {
                username: "Test"
            }
        };
        await commandService.execute(mockMessage as any);
    });
});
