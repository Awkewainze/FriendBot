import { PrismaClient, type TimedEvent } from "@prisma/client";
import dayjs from "dayjs";
import { container, inject, Lifecycle, scoped, type DependencyContainer } from "tsyringe";
import { Logger } from "winston";
import type { TimedEventHandler } from "../events/timed/timedEventHandler";
import { createPrismaClient } from "../utilities/prismaClient";
import { createPrismaLogger } from "../utilities/prismaLogger";

@scoped(Lifecycle.ResolutionScoped)
export class TimedEventService {
	constructor(
		@inject(PrismaClient) private readonly prismaClient: PrismaClient,
		@inject("CorrelationId") private readonly correlationId: string) { }

	async loadUnhandledEventsFromDb(): Promise<void> {
		const unhandledEvents = await this.prismaClient.timedEvent.findMany({
			where: {
				executedAt: null
			}
		});

		unhandledEvents.forEach(x => this.handleEventInternal(x))
	}

	async handleEvent(timedEventInfo: Pick<TimedEvent, "executeAt" | "type" | "guildId" | "userId" | "meta">): Promise<TimedEvent> {
		const created = await this.prismaClient.timedEvent.create({
			data: {
				executeAt: timedEventInfo.executeAt,
				type: timedEventInfo.type,
				correlationId: this.correlationId,
				guildId: timedEventInfo.guildId,
				userId: timedEventInfo.userId,
				meta: timedEventInfo.meta ?? undefined
			}
		});

		await this.handleEventInternal(created);
		return created;
	}

	async cancelEvent(eventId: string): Promise<void> {
		if (TimedEventService.waitingEvents.has(eventId)) {
			clearTimeout(TimedEventService.waitingEvents.get(eventId));
			TimedEventService.waitingEvents.delete(eventId);
			await this.prismaClient.timedEvent.delete({
				where: {
					id: eventId
				}
			});
		}
	}

	// Do this on process exit
	static async cancelAllEvents(): Promise<void> {
		this.waitingEvents.forEach(value => {
			clearTimeout(value);
		});
	}

	private static waitingEvents: Map<string, Timer> = new Map();
	private async handleEventInternal(timedEventInfo: TimedEvent): Promise<void> {
		const eventContainer = this.createChildContainerForTimedEvent(timedEventInfo);
		const event = eventContainer
			.resolveAll<TimedEventHandler>("TimedEventHandler")
			.find(x => x.eventType === timedEventInfo.type);

		if (!event) {
			throw new Error("No matching event type");
		}

		const executeInMillis = Math.max(dayjs(timedEventInfo.executeAt).diff(dayjs()), 0);
		if (!TimedEventService.waitingEvents.has(timedEventInfo.id)) {
			TimedEventService.waitingEvents.set(timedEventInfo.id, setTimeout(() => {
				event.handle(timedEventInfo);
			}, executeInMillis));
		}
	}

	/**
	 * Create a new container scope so logger is attached to correct correlation id.
	 */
	private createChildContainerForTimedEvent(timedEventInfo: TimedEvent): DependencyContainer {
		const _logger = createPrismaLogger({ guildId: timedEventInfo.guildId, userId: timedEventInfo.userId ?? undefined, correlationId: timedEventInfo.correlationId });
		const _prismaClient = createPrismaClient(_logger);
		return container.createChildContainer()
			.register("CorrelationId", { useValue: timedEventInfo.correlationId })
			.register(Logger, { useValue: _logger })
			.register(PrismaClient, { useValue: _prismaClient as any });
	}
}
