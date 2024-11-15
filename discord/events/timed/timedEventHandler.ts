import type { TimedEvent } from "@prisma/client";

export interface TimedEventHandler {
	get eventType(): string;
	handle(event: TimedEvent): Promise<void>;
}
