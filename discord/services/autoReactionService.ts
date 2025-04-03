import { PrismaClient } from "@prisma/client";
import { Message, type OmitPartialGroupDMChannel } from "discord.js";
import { scoped, Lifecycle, inject } from "tsyringe";
import { DatabaseKeyValueStore } from "../utilities/databaseKeyValueStore";

@scoped(Lifecycle.ResolutionScoped)
export class AutoReactionService {
	constructor(@inject(DatabaseKeyValueStore) private readonly kVStore: DatabaseKeyValueStore) {}

	async onMessage(message: OmitPartialGroupDMChannel<Message>): Promise<void> {
		if (message.channel.isDMBased() || message.channel.isVoiceBased() || !message.inGuild()) {
			return;
		}
		this.kVStore.get(this.getIndexForReactionConfiguration(message.guildId));
	}

	private getIndexForReactionConfiguration(guildId: string): string {
		return `autoReactionConfig/${guildId}`;
	}
}
