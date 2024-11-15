import { PermissionName } from "@prisma/client";
import dayjs from "dayjs";
import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, ContextMenuCommandBuilder, PermissionFlagsBits, time, TimestampStyles, type MessageContextMenuCommandInteraction } from "discord.js";
import { inject, Lifecycle, scoped } from "tsyringe";
import { TimedEventService } from "../../services/timedEventService";
import { MessageCommand } from "../command";


abstract class MakeTransientCommand extends MessageCommand {
	constructor(
		private readonly timedEventService: TimedEventService,
		private readonly hours: number) {
		super();
	}
	get name(): string {
		return `Delete in ${this.hours} hours`;
	}

	get data(): ContextMenuCommandBuilder {
		return new ContextMenuCommandBuilder()
			.setName(this.name)
			.setType(ApplicationCommandType.Message as any);
	}

	requiredPermissions: ReadonlySet<PermissionName> = new Set<PermissionName>([
		PermissionName.UseCommands,
		PermissionName.ModifySelf
	]);

	async execute(interaction: MessageContextMenuCommandInteraction): Promise<void> {
		await interaction.deferReply({
			ephemeral: true
		});

		if (!interaction.inGuild() || interaction.targetMessage.member?.id === interaction.user.id || interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) {
			const message = interaction.targetMessage;
			const deleteAt = dayjs().add(this.hours, "hours").toDate();
			const event = await this.timedEventService.handleEvent({
				type: "DeleteMessage",
				executeAt: deleteAt,
				userId: interaction.user.id,
				guildId: interaction.guild?.id ?? null,
				meta: { messageId: message.id, channelId: message.channelId }
			});

			const cancel = new ButtonBuilder()
				.setCustomId("cancel-timedevent-" + event.id)
				.setLabel("Cancel")
				.setStyle(ButtonStyle.Secondary);

			const row = new ActionRowBuilder()
				.addComponents(cancel);
			await interaction.editReply({
				content: `Deleting message at ${time(deleteAt, TimestampStyles.ShortDateTime)}`,
				components: [row as any]
			});
		} else {
			await interaction.editReply({
				content: "You can only delete your own messages"
			})
		}
	}
}



@scoped(Lifecycle.ResolutionScoped, "MessageCommand")
export class MakeTransient1HourCommand extends MakeTransientCommand {
	constructor(
		@inject(TimedEventService) timedEventService: TimedEventService) {
		super(timedEventService, 1);
	}
}


@scoped(Lifecycle.ResolutionScoped, "MessageCommand")
export class MakeTransient6HoursCommand extends MakeTransientCommand {
	constructor(
		@inject(TimedEventService) timedEventService: TimedEventService) {
		super(timedEventService, 6);
	}
}


@scoped(Lifecycle.ResolutionScoped, "MessageCommand")
export class MakeTransient24HoursCommand extends MakeTransientCommand {
	constructor(
		@inject(TimedEventService) timedEventService: TimedEventService) {
		super(timedEventService, 24);
	}
}

