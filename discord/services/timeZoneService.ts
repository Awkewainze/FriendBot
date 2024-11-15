import { type KVStore } from "@prisma/client";
import TimeZones, { type TimeZone } from "timezones-list";
import { inject, Lifecycle, scoped } from "tsyringe";
import { DatabaseKeyValueStore } from "../utilities/databaseKeyValueStore";

@scoped(Lifecycle.ResolutionScoped)
export class TimeZoneService {
	constructor(
		@inject(DatabaseKeyValueStore) private readonly store: DatabaseKeyValueStore
	) { }

	async getUserTimeZone(userId: string): Promise<TimeZone | null> {
		const result = await this.store.get<string>(this.getKeyFromUserId(userId));

		if (result == null) {
			return result ?? null;
		}

		return TimeZones.find(x => x.tzCode === result) ?? null;
	}

	async setUserTimeZone(userId: string, timezoneString: string): Promise<KVStore | null> {
		const timezone = TimeZones.find(x => x.tzCode.toLocaleLowerCase() === timezoneString.toLocaleLowerCase());

		if (!timezone) {
			return null;
		}

		return await this.store.set(this.getKeyFromUserId(userId), timezone.tzCode);
	}

	private getKeyFromUserId(userId: string): string {
		return `timezone_for_user_${userId}`;
	}
}
