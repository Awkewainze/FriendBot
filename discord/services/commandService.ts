import { AutocompleteInteraction, Collection, CommandInteraction } from "discord.js";
import { inject, injectAll, Lifecycle, scoped } from "tsyringe";
import { Logger } from "winston";
import type { Command } from "../commands";
import type { ChatInputCommand, MessageCommand, UserCommand } from "../commands/command";
import { PermissionService } from "./permissionService";

@scoped(Lifecycle.ResolutionScoped)
export class CommandService {
	private readonly commands: Collection<string, Command>;

	constructor(
		@injectAll("ChatInputCommand") _chatInputCommands: ChatInputCommand[],
		@injectAll("UserCommand") _userCommands: UserCommand[],
		@injectAll("MessageCommand") _messageCommands: MessageCommand[],
		@inject(PermissionService) private readonly permissionsService: PermissionService,
		@inject(Logger) private readonly logger: Logger
	) {
		this.commands = new Collection([..._chatInputCommands, ..._userCommands, ..._messageCommands].map(x => [x.name, x]));
	}

	async commandHandler(interaction: CommandInteraction) {
		const command = this.commands.get(interaction.commandName);
		if (!command) {
			// not our command
			return;
		}

		try {
			this.logger.debug("Attempting to handle command", { name: interaction.commandName, options: interaction.options.data, channelId: interaction.channelId, commandType: command.commandType });
			if (interaction.guild) {
				if (!(await this.permissionsService.userHasPermissions(interaction.user.id, interaction.guild.id, [...command.requiredPermissions]))) {
					this.logger.warn("Permission denied");
					await interaction.reply({
						content: "Missing required permissions to use this command",
						ephemeral: true
					})
					return;
				}

			}

			if (!command.filter(interaction.user, interaction.guild)) {
				this.logger.debug("Custom filter failure");
				await interaction.reply({
					content: "Unable to execute command due to custom filter",
					ephemeral: true
				})
				return;
			}

			await command.execute(interaction);
		} catch (err) {
			this.logger.error("Error while handling command", { error: err });
			const response = {
				content: "An error occurred while executing your command",
				ephemeral: true
			};
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp(response);
			} else {
				await interaction.reply(response);
			}
		} finally {
			if (!interaction.replied && !interaction.deferred) {
				interaction.reply({
					content: "Command executed with no response",
					ephemeral: true
				});
			}
		}
	}

	async autoCompleteHandler(interaction: AutocompleteInteraction) {
		const command = this.commands.get(interaction.commandName);
		if (!command) {
			// not our command
			return;
		}

		if (!command.isChatInputCommand()) {
			// This shouldn't be possible but just being safe
			return;
		}

		try {
			await command.autoComplete(interaction);
		} catch (err) {
			this.logger.error("Error while handling autocomplete", { error: err });
		}
	}
}
