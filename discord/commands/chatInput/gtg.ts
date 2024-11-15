import { PermissionName } from "@prisma/client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { inject, Lifecycle, scoped } from "tsyringe";
import { DatabaseKeyValueStore } from "../../utilities/databaseKeyValueStore";
import { ChatInputCommand } from "../command";
dayjs.extend(relativeTime);

@scoped(Lifecycle.ResolutionScoped, "xChatInputCommand")
export class GotToGoCommand extends ChatInputCommand {
	get name(): string {
		return "got_to_go";
	}
	override requiredPermissions: ReadonlySet<PermissionName> = new Set<PermissionName>([
		PermissionName.UseCommands,
		PermissionName.ModifySelf
	]);
	devOnly: boolean = false;

	constructor(
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

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {

	}
}
