import { Message } from "discord.js";
import { delay, inject, injectAll, Lifecycle, scoped } from "tsyringe";
import winston from "winston";
import { Command } from "../commands";
import { GuildMemberScopedPermissionService } from "../services";

/**
 * Manages the order and execution of commands.
 * @category Service
 */
@scoped(Lifecycle.ResolutionScoped)
export class CommandService {
    constructor(
        @injectAll("Command") private readonly commands: Array<Command>,
        @inject("Logger") private readonly logger: winston.Logger,
        @inject(delay(() => GuildMemberScopedPermissionService))
        private readonly guildMemberScopedPermissionService: GuildMemberScopedPermissionService
    ) {
        this.commands.sort(c => c.priority() * -1);
        this.logger = this.logger.child({ src: "CommandService" });
    }

    get Commands(): ReadonlyArray<Command> {
        return this.commands;
    }

    /**
     * Runs through the list of managed commands and checks for if the given message should trigger a command.
     * @param message Message to check then execute if passes command requirements.
     */
    async execute(message: Message): Promise<void> {
        try {
            const currentUserPermissions = await this.guildMemberScopedPermissionService.getMyPermissions();
            for (const command of this.commands) {
                if (await command.check(message)) {
                    if (
                        !message.member.permissions.has("ADMINISTRATOR") &&
                        Array.from(command.requiredPermissions()).some(
                            requiredPermission => !currentUserPermissions.has(requiredPermission)
                        )
                    ) {
                        message.reply("You do not have permission to run this command!");
                        return;
                    }
                    this.logger.info({
                        message: `Command executed - ${command.constructor.name} by ${message.author.username}`,
                        fullMessage: message.toString(),
                        command: command.constructor.name,
                        caller: {
                            id: message.author.id,
                            username: message.author.username
                        }
                    });
                    await command.execute(message);
                    if (command.exclusive()) {
                        return;
                    }
                }
            }
        } catch (err) {
            this.logger.error({
                message: "Error on command",
                user: {
                    id: message.member.id,
                    displayName: message.member.displayName,
                    username: message.member.user.username
                },
                error: err.toString(),
                content: message.content
            });
        }
    }
}
