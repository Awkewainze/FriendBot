import { Message } from "discord.js";
import { Command } from "../../src/commands/command";
import { GuildMemberScopedPermissionService } from "../../src/services";
import { CommandService } from "../../src/services/commandService";
import { noop, Permission } from "../../src/utils";
import { TestLogger } from "../testLogger";
class MockCommand implements Command {
    public constructor(
        private readonly shouldCheck: boolean,
        private readonly onExecute: () => void,
        private readonly priorityCon: number,
        private readonly exclusiveCon: boolean,
        private readonly requiredPermissionsCon: Set<Permission>
    ) { }
    requiredPermissions(): Set<Permission> {
        return this.requiredPermissionsCon;
    }
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
const MockGuildMemberScopedPermissionService = jest.fn().mockImplementation(() => ({
    getMyPermissions: jest.fn()
}))

describe("commandService", () => {
    it("should order commands by priority", async () => {
        let hitFirst = false;
        const commandService = new CommandService([new MockCommand(
            true,
            () => {
                expect(hitFirst).toBe(true);
            },
            1,
            false,
            new Set()
        ), new MockCommand(
            true,
            () => {
                hitFirst = true;
            },
            2,
            false,
            new Set()
        )], TestLogger,
        new MockGuildMemberScopedPermissionService() as any as GuildMemberScopedPermissionService);
        const mockMessage = {
            member: {
                permissions: {
                    has: jest.fn().mockReturnValue(true)
                }
            },
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
            false,
            new Set()
        ), new MockCommand(true, noop, 10, true, new Set())],
        TestLogger,
        new MockGuildMemberScopedPermissionService() as any as GuildMemberScopedPermissionService);
        const mockMessage = {
            member: {
                permissions: {
                    has: jest.fn().mockReturnValue(true)
                }
            },
            author: {
                username: "Test"
            }
        };
        await commandService.execute(mockMessage as any);
    });
});
