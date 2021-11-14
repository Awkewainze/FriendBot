import { MessageReaction, PartialUser, User } from "discord.js";
import { container } from "tsyringe";
import { ReactionService } from "../services";

// eslint-disable-next-line @typescript-eslint/no-empty-function
export async function OnReactionAdd(reaction: MessageReaction, user: User | PartialUser): Promise<void> {
    container.resolve(ReactionService).sendEvent({ reaction, user });
}
