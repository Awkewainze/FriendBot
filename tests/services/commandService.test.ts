import { Message } from "discord.js";
import { Command } from "../../src/commands/command";
import { CommandService } from "../../src/services/commandService";
import { noop } from "../../src/utils";

class MockCommand implements Command {
    public constructor(
        private readonly shouldCheck: boolean,
        private readonly onExecute: () => void,
        private readonly priorityCon: number,
        private readonly exclusiveCon: boolean
    ) {}
    check(message: Message): boolean {
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
        const commandService = new CommandService();
        let hitFirst = false;
        commandService.registerCommand(
            new MockCommand(
                true,
                () => {
                    expect(hitFirst).toBe(true);
                },
                1,
                false
            )
        );
        commandService.registerCommand(
            new MockCommand(
                true,
                () => {
                    hitFirst = true;
                },
                2,
                false
            )
        );
        await commandService.execute(null);
    });
    it("should not run a command after exclusive command hit", async () => {
        const commandService = new CommandService();
        commandService.registerCommand(
            new MockCommand(
                true,
                () => {
                    fail("should not reach run");
                },
                1,
                false
            )
        );
        commandService.registerCommand(new MockCommand(true, noop, 10, true));
        await commandService.execute(null);
    });
});
