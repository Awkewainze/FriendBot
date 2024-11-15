import { PermissionName } from "@prisma/client";
import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import TimeZones from "timezones-list";
import { inject, Lifecycle, scoped } from "tsyringe";
import { TimeZoneService } from "../../services/timeZoneService";
import { ChatInputCommand } from "../command";

@scoped(Lifecycle.ResolutionScoped, "ChatInputCommand")
export class SetTimeZoneCommand extends ChatInputCommand {
	get name(): string {
		return "set_time_zone";
	}
	override requiredPermissions: ReadonlySet<PermissionName> = new Set<PermissionName>([
		PermissionName.UseCommands,
		PermissionName.ModifySelf
	]);

	constructor(
		@inject(TimeZoneService) private readonly timeZoneService: TimeZoneService
	) {
		super();
	}

	get data(): SlashCommandBuilder {
		return new SlashCommandBuilder()
			.setName(this.name)
			.setDescription("Set your timezone for other commands")
			.addStringOption((option) =>
				option.setName("time_zone")
					.setDescription("What time zone are you in?")
					.setAutocomplete(true)
					.setRequired(true)
			) as any;
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		await interaction.deferReply({
			ephemeral: true
		});
		const result = await this.timeZoneService.setUserTimeZone(interaction.user.id, interaction.options.getString("time_zone", true));

		if (!result) {
			await interaction.editReply("Invalid timezone code, use a TZ indentifier from this list https://en.wikipedia.org/wiki/List_of_tz_database_time_zones");
			return;
		}

		await interaction.editReply("Time zone set to " + result.value);
	}

	async autoComplete(interaction: AutocompleteInteraction): Promise<void> {
		const focusedValue = interaction.options.getFocused();
		const choices = TimeZones.filter(x => x.tzCode.toLocaleLowerCase().includes(focusedValue.toLocaleLowerCase())).splice(0, 10);
		await interaction.respond(
			choices.map(choice => ({ name: choice.tzCode, value: choice.tzCode })),
		);
	}
}
