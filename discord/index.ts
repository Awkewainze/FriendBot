import { Prisma, PrismaClient, Severity } from "@prisma/client";
import {
	AutocompleteInteraction,
	BaseInteraction,
	ButtonInteraction,
	Client,
	CommandInteraction,
	Events,
	Message,
	ModalSubmitInteraction,
	REST,
	Routes,
	VoiceState,
	type OmitPartialGroupDMChannel
} from "discord.js";
import { bufferTime, debounceTime, filter, fromEvent, groupBy, mergeMap, Observable } from "rxjs";
import { container, type DependencyContainer } from "tsyringe";
import { v4 } from "uuid";
import { Logger } from "winston";
import "./commands";
import type { Command } from "./commands";
import type { ChatInputCommand, MessageCommand } from "./commands/command";
import "./events";
import { CommandService } from "./services/commandService";
import { TimedEventService } from "./services/timedEventService";
import { _PrismaClient, createPrismaClient } from "./utilities/prismaClient";
import { createPrismaLogger } from "./utilities/prismaLogger";
import { AutoReactionService } from "./services";

const client = new Client({
	intents: [
		"DirectMessages",
		"GuildMembers",
		"GuildMessageReactions",
		"GuildMessages",
		"GuildPresences",
		"GuildVoiceStates",
		"GuildScheduledEvents",
		"MessageContent",
		"Guilds"
	]
});

const correlationId = v4();
const logger = createPrismaLogger({ correlationId });
logger.log(Severity.info, "Runtime logger created");
(["warn", "info", "error"] as const).forEach((level) => {
	_PrismaClient.$on(level, (event: Prisma.LogEvent) => {
		logger.log(level, `prisma/${level}`, { originalMessage: event.message, ...event, message: undefined });
	});
});

const prismaClient = createPrismaClient(logger);
logger.info("Runtime prisma client created");

let isExiting = false;
(["SIGINT", "SIGTERM", "SIGQUIT"] as const).forEach((event) => {
	process.on(event, async (code) => {
		isExiting = true;
		logger.info("Exitting process", { event, code });
		await Promise.all([client.destroy(), TimedEventService.cancelAllEvents()]);
		process.exit(0);
	});
});

// process.on("unhandledRejection", (reason) => {

// });

// const unhandledRejectionObservable = fromEvent(process, "unhandledRejection", (error: NodeJS.UnhandledRejectionListener) => [error, origin] as const);
// unhandledRejectionObservable.subscribe(([error, origin]) => {
// 	logger.error("unhandledRejection", {
// 		overrideEventType: "unhandledRejection",
// 		exception: { cause: error.cause, stack: error.stack, message: error.message, name: error.name }
// 	});
// });

const uncaughtExceptionObservable = fromEvent(
	process,
	"uncaughtException",
	(error: Error, origin: NodeJS.UncaughtExceptionOrigin) => [error, origin] as const
);
uncaughtExceptionObservable.subscribe(([error, origin]) => {
	logger.error("uncaughtException", {
		overrideEventType: "uncaughtException",
		exception: { cause: error.cause, stack: error.stack, message: error.message, name: error.name }
	});
});

// Force exit if more than 10 errors occur within a second
uncaughtExceptionObservable
	.pipe(bufferTime(1000))
	.pipe(filter((x) => x.length >= 10))
	.subscribe(async () => {
		await Promise.all([client.destroy(), TimedEventService.cancelAllEvents()]);
		process.abort();
	});

fromEvent(client, "error", (error: Error) => error).subscribe((error) => {
	logger.error("discordClientError", {
		overrideEventType: "discordClientError",
		exception: { cause: error.cause, stack: error.stack, message: error.message, name: error.name }
	});
});

const onVoiceStateUpdate = fromEvent(
	client,
	"voiceStateUpdate",
	(oldState: VoiceState, newState: VoiceState) => [oldState, newState] as const
);

onVoiceStateUpdate.pipe(filter(() => !isExiting)).subscribe(async ([oldState, newState]) => {
	if (oldState.channelId !== newState.channelId) {
		const correlationId = v4();
		const member = (newState.member ?? oldState.member)!;
		const logger = createPrismaLogger({ guildId: member.guild.id, userId: member.id, correlationId });
		const prismaClient = createPrismaClient(logger);

		await prismaClient.event.create({
			data: {
				type: "discord/voiceStateUpdate",
				message: "Voice state update",
				guildId: oldState.guild.id,
				userId: oldState.member?.id,
				correlationId,
				severity: Severity.functional,
				meta: {
					oldChannelId: oldState.channelId,
					newChannelId: newState.channelId
				}
			}
		});
	}
});

function createChildContainerFromInteraction(interaction: BaseInteraction): DependencyContainer {
	const correlationId = v4();
	const interactionLogger = createPrismaLogger({
		guildId: interaction.guildId,
		userId: interaction.user.id,
		correlationId
	});

	return container
		.createChildContainer()
		.register("CorrelationId", { useValue: correlationId })
		.register(Logger, { useValue: interactionLogger })
		.register(PrismaClient, { useValue: createPrismaClient(interactionLogger) as any as PrismaClient });
}

const onInteractionCreate = (fromEvent(client, Events.InteractionCreate) as Observable<BaseInteraction>).pipe(
	filter(() => !isExiting)
);

onInteractionCreate.pipe(filter((x) => x.isCommand())).subscribe((commandInteraction: CommandInteraction) => {
	createChildContainerFromInteraction(commandInteraction).resolve(CommandService).commandHandler(commandInteraction);
});

onInteractionCreate
	.pipe(filter((x) => x.isAutocomplete()))
	.pipe(
		groupBy((x) => x.user.id),
		mergeMap((x) => x.pipe(debounceTime(100)))
	)
	.subscribe((autoCompleteInteraction: AutocompleteInteraction) => {
		createChildContainerFromInteraction(autoCompleteInteraction)
			.resolve(CommandService)
			.autoCompleteHandler(autoCompleteInteraction);
	});

onInteractionCreate
	.pipe(filter((x) => x.isButton()))
	.pipe(filter((x) => x.customId.startsWith("cancel-timedevent-")))
	.subscribe(async (buttonInteraction: ButtonInteraction) => {
		createChildContainerFromInteraction(buttonInteraction)
			.resolve(TimedEventService)
			.cancelEvent(buttonInteraction.customId.substring("cancel-timedevent-".length));
		await buttonInteraction.reply({ content: "Canceled", ephemeral: true });
	});

onInteractionCreate
	.pipe(filter((x) => x.isModalSubmit()))
	.subscribe(async (modalSubmitInteraction: ModalSubmitInteraction) => {
		console.log("modalSubmitInteraction", modalSubmitInteraction.fields.fields);
	});

let _commandsRegistered = false;
async function registerCommands(commands: Command[]): Promise<void> {
	logger.debug("Registering commands", { commands: commands.map((x) => (x as ChatInputCommand).data.name) });
	try {
		if (!_commandsRegistered) {
			_commandsRegistered = true;
			const rest = new REST().setToken(process.env.DISCORD_LOGIN_TOKEN);
			const route = Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID);
			const data = await rest.put(route, {
				body: commands.map((x) => x.data.toJSON())
			});
			logger.debug("Register commands response", { data });
		}
	} catch (error) {
		logger.error("Error registering commands", { error });
	}
}

container.register(Client, { useValue: client });

const globalChildContainer = container.createChildContainer();

globalChildContainer.register("CorrelationId", { useValue: correlationId });
globalChildContainer.register(Logger, { useValue: logger });
globalChildContainer.register(PrismaClient, { useValue: prismaClient as any as PrismaClient });
const _chatInputCommands: ChatInputCommand[] = globalChildContainer.resolveAll("ChatInputCommand");
const _messageCommands = globalChildContainer.resolveAll<MessageCommand>("MessageCommand");

const onMessageCreate = fromEvent(client, "messageCreate", (message: OmitPartialGroupDMChannel<Message>) => message);
onMessageCreate.subscribe(async (message) => {
	await globalChildContainer.resolve(AutoReactionService).onMessage(message);
});

client.on(Events.ClientReady, async (_client) => {
	await globalChildContainer.resolve(TimedEventService).loadUnhandledEventsFromDb();
	logger.info("Client Ready");
});

await registerCommands([..._chatInputCommands, ..._messageCommands]);
await client.login(process.env.DISCORD_LOGIN_TOKEN);
