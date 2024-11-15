import { PrismaClient, type TimedEvent } from "@prisma/client";
import { Client } from "discord.js";
import { inject, Lifecycle, scoped } from "tsyringe";
import { Logger } from "winston";
import type { TimedEventHandler } from "./timedEventHandler";

@scoped(Lifecycle.ResolutionScoped, "TimedEventHandler")
export class KickUserHandler implements TimedEventHandler {
	constructor(@inject(Logger) private readonly logger: Logger,
		@inject(PrismaClient) private readonly prismaClient: PrismaClient,
		@inject(Client) private readonly client: Client) { }

	get eventType(): string {
		return "KickUser";
	}
	async handle(event: TimedEvent): Promise<void> {
		const user = await this.client.users.fetch((event.meta as any).targetUserId);
		return;
		if (!event.guildId) {
			return;
		}
		// this.client.guilds.fetch(event.guildId).

		// 	if(channel && channel.isTextBased()) {
		// 	const message = await channel.messages.fetch((event.meta as any).messageId);
		// 	this.logger.debug("Attempting to delete", { channel: { id: channel?.id }, messageInfo: { id: message?.id, content: message?.content } });
		// 	if (message.deletable) {
		// 		message.delete();
		// 	}
		// }
		// await this.prismaClient.timedEvent.update({
		// 	where: {
		// 		id: event.id
		// 	},
		// 	data: {
		// 		executedAt: new Date()
		// 	}
		// });
	}
}
