import { PrismaClient } from "@prisma/client";
import type { Logger } from "winston";

export const _PrismaClient = new PrismaClient({
	log: [
		{ level: "warn", emit: "event" },
		{ level: "info", emit: "event" },
		{ level: "error", emit: "event" }
	],
});

export function createPrismaClient(logger: Logger) {
	return _PrismaClient.$extends({
		name: "metrics",
		query: {
			async $allOperations({ model, operation, args, query }) {
				try {
					logger.debug("prisma/query/start", { model, operation, args });
					const start = performance.now();
					const result = await query(args);
					const end = performance.now();
					const time = end - start;

					logger.debug("prisma/query/end", { time });

					return result;
				} catch (err) {
					logger.error("prisma/query/error", { error: err });
					throw err;
				}
			}
		}
	});
}

// elizabeth@colibrifamilyandhealingtherapyinc.com

