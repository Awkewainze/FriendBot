import { PermissionName, PrismaClient, Severity } from "@prisma/client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ChatInputCommandInteraction, SlashCommandBuilder, time, TimestampStyles } from "discord.js";
import { inject, Lifecycle, scoped } from "tsyringe";
import { Logger } from "winston";
import { ChatInputCommand } from "../command";
dayjs.extend(relativeTime);

@scoped(Lifecycle.ResolutionScoped, "ChatInputCommand")
export class WhoCommand extends ChatInputCommand {
	get name(): string {
		return "who";
	}
	override requiredPermissions: ReadonlySet<PermissionName> = new Set<PermissionName>([PermissionName.UseCommands]);
	devOnly: boolean = false;

	constructor(
		@inject(PrismaClient) private readonly prismaClient: PrismaClient,
		@inject(Logger) private readonly logger: Logger
	) {
		super();
	}

	get data(): SlashCommandBuilder {
		return new SlashCommandBuilder()
			.setName(this.name)
			.setDescription("Get recent activity for the voice channel in you are currently in")
			.addStringOption((option) =>
				option
					.setName("direction")
					.setDescription("Joined or Left?")
					.setRequired(true)
					.addChoices({ name: "joined", value: "joined" }, { name: "left", value: "left" })
			) as any;
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		await interaction.deferReply({ ephemeral: true });
		if (interaction.member == null) throw new Error();

		const voiceChannelId = interaction.guild?.members.resolve(interaction.member.user.id)?.voice?.channelId;
		if (voiceChannelId == null) {
			this.logger.log(Severity.debug, "Command run outside voice channel");
			await interaction.editReply("This command must be run while you are in a voice channel!");
			return;
		}

		const direction = interaction.options.getString("direction");
		if (direction == null || !["joined", "left"].includes(direction)) {
			this.logger.log(Severity.debug, "Invalid suboption");
			await interaction.editReply("Invalid suboption");
			return;
		}

		const allResults = await this.prismaClient.event.findMany({
			where: {
				AND: {
					guildId: interaction.guildId,
					type: "discord/voiceStateUpdate",
					dateTime: {
						gt: dayjs().add(-2, "minute").toDate()
					}
				}
			},
			orderBy: {
				dateTime: "asc"
			}
		});

		if (direction === "joined") {
			const whoJoined = allResults
				.filter((x) => (x.meta as { newChannelId: string }).newChannelId === voiceChannelId)
				.map((x) => ({ userId: x.userId, dateTime: x.dateTime }));
			const lines = whoJoined.map(
				(x) => `${interaction.guild?.members.cache.get(x.userId!)?.displayName} joined at ${time(x.dateTime, TimestampStyles.LongTime)}`
			);
			const asString = (lines.length > 0 ? lines : ["No one has joined recently"]).join("\n");
			await interaction.followUp(asString);
		} else {
			const whoLeft = allResults
				.filter((x) => (x.meta as { oldChannelId: string }).oldChannelId === voiceChannelId)
				.map((x) => ({ userId: x.userId, dateTime: x.dateTime }));
			const lines = whoLeft.map(
				(x) => `${interaction.guild?.members.cache.get(x.userId!)?.displayName} left at ${time(x.dateTime, TimestampStyles.LongTime)}`
			);
			const asString = (lines.length > 0 ? lines : ["No one has left recently"]).join("\n");
			await interaction.followUp({
				content: asString,
				ephemeral: false
			});
		}
	}
}
