import type { PermissionName } from "@prisma/client";
import type {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	CommandInteraction,
	ContextMenuCommandBuilder,
	ContextMenuCommandInteraction,
	Guild,
	MessageContextMenuCommandInteraction,
	SlashCommandBuilder,
	User,
	UserContextMenuCommandInteraction,
	VoiceState
} from "discord.js";

export function checkChatCommandNameAllowed(name: string): boolean {
	return /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u.test(name) && name.toLocaleLowerCase() === name;
}

export function checkUserOrMessageCommandNameAllowed(name: string): boolean {
	return /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}\w]{1,32}$/iu.test(name);
}

export abstract class Command {
	abstract get name(): string;
	abstract get data(): SlashCommandBuilder | ContextMenuCommandBuilder;
	abstract requiredPermissions: ReadonlySet<PermissionName>;
	/**
	 * Type of command this is, defaults to "CHAT_INPUT"
	 * https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types
	 */
	abstract commandType: "CHAT_INPUT" | "USER" | "MESSAGE";
	isChatInputCommand(): this is ChatInputCommand {
		return this.commandType === "CHAT_INPUT" && this instanceof ChatInputCommand;
	}

	isUserCommand(): this is UserCommand {
		return this.commandType === "USER" && this instanceof UserCommand;
	}

	isMessageCommand(): this is MessageCommand {
		return this.commandType === "MESSAGE" && this instanceof MessageCommand;
	}

	abstract execute(interaction: CommandInteraction): Promise<void>;
	/**
	 * Returns if a command should run based on current user, runs after permissions check
	 * @returns boolean if this command should run
	 */
	filter(user: User, guild: Guild | null): boolean {
		return true;
	}

	protected getInvokerVoice(interaction: CommandInteraction): VoiceState | undefined {
		return interaction.guild?.members.resolve(interaction.member!.user.id)?.voice;
	}
}

/** Slash commands */
export abstract class ChatInputCommand extends Command {
	commandType: "CHAT_INPUT" | "USER" | "MESSAGE" = "CHAT_INPUT";
	abstract get data(): SlashCommandBuilder;

	abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;
	/**
	 * Meant to be overridden, use see [discord.js docs](https://discordjs.guide/slash-commands/autocomplete.html#enabling-autocomplete) for reference
	 */
	autoComplete(interaction: AutocompleteInteraction): Promise<void> {
		return Promise.resolve();
	}
}

export abstract class ContextCommand extends Command {
	abstract get data(): ContextMenuCommandBuilder;
	abstract execute(interaction: ContextMenuCommandInteraction): Promise<void>;
}

export abstract class UserCommand extends ContextCommand {
	commandType: "CHAT_INPUT" | "USER" | "MESSAGE" = "USER";
	abstract execute(interaction: UserContextMenuCommandInteraction): Promise<void>;
}

export abstract class MessageCommand extends ContextCommand {
	commandType: "CHAT_INPUT" | "USER" | "MESSAGE" = "MESSAGE";
	abstract get data(): ContextMenuCommandBuilder;
	abstract execute(interaction: MessageContextMenuCommandInteraction): Promise<void>;
}
