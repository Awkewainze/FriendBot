import { PrismaClient } from "@prisma/client";
import { inject, Lifecycle, scoped } from "tsyringe";

@scoped(Lifecycle.ResolutionScoped)
export class GuildService {
	constructor(@inject(PrismaClient) private readonly prismaClient: PrismaClient) { }

	async setGuildPinnedChannel(
		guildId: string,
		pinnedChannelId: string,
	): Promise<void> {
		this.prismaClient.guild.upsert({
			where: {
				id: guildId,
			},
			create: {
				id: guildId,
				pinnedChannelId,
			},
			update: {
				pinnedChannelId,
			},
		});
	}

	async getGuildPinnedChannel(guildId: string): Promise<string | null> {
		return (
			(
				await this.prismaClient.guild.findFirst({
					where: {
						id: guildId,
					},
				})
			)?.pinnedChannelId ?? null
		);
	}
}
