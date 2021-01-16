import { MessageReaction, PartialUser, User } from "discord.js";

export async function OnReactionAdd(reaction: MessageReaction, user: User | PartialUser): Promise<void> {}
