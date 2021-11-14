import { MessageReaction, PartialUser, User } from "discord.js";
import { filter, Observable, Subject } from "rxjs";
import { inject, Lifecycle, scoped, singleton } from "tsyringe";
import winston from "winston";

@singleton()
export class ReactionService {
    constructor(@inject("Logger") private readonly logger: winston.Logger) {}

    private readonly reactionSubject = new Subject<{ reaction: MessageReaction; user: User | PartialUser }>();
    sendEvent(event: { reaction: MessageReaction; user: User | PartialUser }): void {
        this.reactionSubject.next(event);
    }

    getObservable(): Observable<{ reaction: MessageReaction; user: User | PartialUser }> {
        return this.reactionSubject.asObservable();
    }
}

@scoped(Lifecycle.ResolutionScoped)
export class GuildScopedReactionService {
    constructor(
        @inject("Logger") private readonly logger: winston.Logger,
        @inject(ReactionService) private readonly reactionService: ReactionService,
        @inject("GuildId") private readonly guildId: string
    ) {}

    getScopedObservable(): Observable<{ reaction: MessageReaction; user: User | PartialUser }> {
        return this.reactionService.getObservable().pipe(filter(x => x.reaction.message.guild.id === this.guildId));
    }
}
