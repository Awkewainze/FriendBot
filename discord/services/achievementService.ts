import { PrismaClient, type Achievement } from "@prisma/client";
import { inject } from "tsyringe";

export class AchievementService {
	constructor(@inject(PrismaClient) private readonly prismaClient: PrismaClient) { }

	getUserAchievements(
		guildId: string,
		userId: string
	): Promise<Achievement[]> {
		return this.prismaClient.achievement.findMany({
			where: {
				userId,
				guildId,
			},
		});
	}

	getUserAchievement(
		guildId: string,
		userId: string,
		achievementName: string
	): Promise<Achievement | null> {
		return this.prismaClient.achievement.findFirst({
			where: {
				userId,
				guildId,
				name: achievementName
			},
		});
	}

	async setUserAchievement({ guildId, userId, achievementName, progress, goal, grantedOn }: {
		guildId: string,
		userId: string,
		achievementName: string,
		/** Current progress towards goal */
		progress?: number,
		/** End goal to achieve */
		goal?: number,
		/** Leave `undefined` or `null` if still in progress, set to `Date` to mark completed */
		grantedOn?: Date,
	}): Promise<void> {
		await this.prismaClient.achievement.upsert({
			where: {
				id: undefined,
				AND: [
					{
						guildId,
					},
					{
						userId,
					},
					{
						name: achievementName,
					},
				],
			},
			create: {
				guildId,
				userId,
				name: achievementName,
				progress,
				goal,
				grantedOn,
			},
			update: {
				progress,
				goal,
				grantedOn,
			},
		});
	}
}
