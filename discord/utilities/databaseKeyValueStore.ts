import { PrismaClient, type KVStore as KVStoreType, type Prisma } from "@prisma/client";
import { inject, Lifecycle, scoped } from "tsyringe";
import { Logger } from "winston";

@scoped(Lifecycle.ResolutionScoped)
export class DatabaseKeyValueStore {
	constructor(
		@inject(PrismaClient) private readonly prismaClient: PrismaClient,
		@inject(Logger) private readonly logger: Logger
	) { }
	/**
	 *
	 * @param key
	 * @returns The value or undefined if not found
	 */
	async get<T>(key: string): Promise<T | undefined> {
		try {
			this.logger.debug("kvs/get", { key });
			const result = await this.prismaClient.kVStore.findFirstOrThrow({
				where: {
					key
				}
			});
			return result.value as T;
		} catch (err) {
			this.logger.error("kvs/get/error", { error: err });
		}
	}
	/**
	 *
	 * @param key
	 * @param value
	 * @returns
	 */
	async set<T extends Prisma.InputJsonValue>(key: string, value: T): Promise<KVStoreType> {
		this.logger.debug("kvs/set", { key, value });
		return await this.prismaClient.kVStore.upsert({
			create: {
				key,
				value
			},
			update: {
				key,
				value
			},
			where: {
				key
			}
		});
	}
}
