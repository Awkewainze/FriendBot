import { PrismaClient, Severity } from "@prisma/client";
import Transport from "winston-transport";

export class DiscordPrismaTransport extends Transport {
	private readonly prismaClient: () => PrismaClient;
	private readonly guildId?: string | null;
	private readonly userId?: string;
	private readonly correlationId?: string;
	constructor(opts: Transport.TransportStreamOptions & {
		connection: () => PrismaClient,
		guildId?: string | null,
		userId?: string,
		correlationId?: string,
	}) {
		super(opts);
		this.prismaClient = opts.connection;
		this.guildId = opts.guildId;
		this.userId = opts.userId;
		this.correlationId = opts.correlationId;
	}

	public log?(info: any, next: () => void): any {
		setImmediate(() => {
			this.emit("log", info);
		});

		const meta = { ...info };
		delete meta.message;
		delete meta.level;
		delete meta.overrideEventType;

		this.prismaClient().event.create({
			data: {
				severity: info.level ?? Severity.debug,
				message: info.message,
				guildId: this.guildId,
				userId: this.userId,
				correlationId: this.correlationId,
				meta,
				type: info.overrideEventType ?? "log",
			}
		}).then(() => {
			next();
		});
	}
};
