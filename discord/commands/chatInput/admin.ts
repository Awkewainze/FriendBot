import { PermissionName, PrismaClient } from "@prisma/client";
import { ChatInputCommandInteraction, SlashCommandBuilder, User } from "discord.js";
import { inject, Lifecycle, scoped } from "tsyringe";
import { Logger } from "winston";
import { DatabaseKeyValueStore } from "../../utilities/databaseKeyValueStore";
import { ChatInputCommand } from "../command";

@scoped(Lifecycle.ResolutionScoped, "xChatInputCommand")
export class AdminCommand extends ChatInputCommand {
	get name(): string {
		return "admin";
	}
	override requiredPermissions: ReadonlySet<PermissionName> = new Set<PermissionName>([
		PermissionName.UseCommands
	]);
	devOnly: boolean = true;

	constructor(
		@inject(PrismaClient) private readonly prismaClient: PrismaClient,
		@inject(Logger) private readonly logger: Logger,
		@inject(DatabaseKeyValueStore) private readonly kVStore: DatabaseKeyValueStore
	) {
		super();
	}

	get data(): SlashCommandBuilder {
		return new SlashCommandBuilder()
			.setName(this.name)
			.setDescription("Auto kicks you when you gotta go")
			.addStringOption((option) =>
				option.setName("when").setDescription("When you want to leave").setRequired(true)
			) as any;
	}

	userFilter = (user: User) => {
		if (user.id === "") {
			return false;
		}

		return true;
	}


	async execute(interaction: ChatInputCommandInteraction): Promise<void> { }
}
