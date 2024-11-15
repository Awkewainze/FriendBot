import { lazy } from "discord.js";
import { v4 } from "uuid";
import { createLogger } from "winston";
import { Console } from "winston/lib/winston/transports";
import { DiscordPrismaTransport } from "./discordPrismaTransport";
import { _PrismaClient } from "./prismaClient";

export function createPrismaLogger(opts?: { guildId?: string | null, userId?: string, correlationId?: string }) {
	return createLogger({
		level: "silly",
		transports: [
			new DiscordPrismaTransport({
				connection: lazy(() => _PrismaClient),
				guildId: opts?.guildId,
				userId: opts?.userId,
				correlationId: opts?.correlationId ?? v4()
			}),
			new Console({
				level: "error"
			})
		]
	});
}
