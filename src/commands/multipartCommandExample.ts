import { Message } from "discord.js";
import { inject, injectable } from "tsyringe";
import { CachingService, GuildScopedIndex, Index, PersistentCachingService } from "../services";
import { Command } from "./command";

/** This is the more complicated and more direct way of setting state, look at {@link SimpleMultipartExampleCommand} for simpler way to manage state. */
@injectable()
export class MultipartExampleCommand extends Command {
    constructor(
        @inject(GuildScopedIndex) private readonly index: Index,
        @inject("CachingService")
        private readonly cachingService: CachingService,
        @inject("PersistentCachingService")
        private readonly persistentCachingService: PersistentCachingService
    ) {
        super();
        this.index = index.addScope("MultipartExampleCommand");
    }
    async check(message: Message): Promise<boolean> {
        const nameState = await this.persistentCachingService.getOrAdd(
            this.getMemberScopedIndex(message).getKey(Keys.GuildNameState),
            GuildNameState.NotSet
        );
        const commandState = await this.cachingService.getOrAdd(
            this.getMemberChannelScopedIndex(message).getKey(Keys.CommandState),
            CommandState.None
        );
        return (
            /^setName$/i.test(message.content) ||
            commandState !== CommandState.None ||
            (/^sayName$/.test(message.content) && nameState === GuildNameState.Set)
        );
    }

    async execute(message: Message): Promise<void> {
        // Pay attention to the scopes and which cache is used here, I use guild scope to store name data object and whether or not it's set in the persistent cache.
        // And I use channel scope to store what step the member is on for setting their name in the nonpersistent cache, because so what if the command fails partway.
        const guildNameStateKey = this.getMemberScopedIndex(message).getKey(Keys.GuildNameState);
        const channelStateKey = this.getMemberChannelScopedIndex(message).getKey(Keys.CommandState);
        const dataKey = this.getMemberScopedIndex(message).getKey(Keys.Data);
        let currentChannelState: CommandState = CommandState.None;
        let currentGuildState: GuildNameState = GuildNameState.NotSet;

        if (/^setName$/i.test(message.content)) {
            await this.cachingService.set(channelStateKey, CommandState.None);
            await this.persistentCachingService.set(guildNameStateKey, GuildNameState.NotSet);
        } else {
            currentChannelState = await this.cachingService.getOrAdd<CommandState>(channelStateKey, CommandState.None);
            currentGuildState = await this.persistentCachingService.getOrAdd<GuildNameState>(
                guildNameStateKey,
                GuildNameState.NotSet
            );
        }

        if (currentGuildState === GuildNameState.Set && /^sayName$/i.test(message.content)) {
            const data = await this.persistentCachingService.getOrAdd<Data>(dataKey, {});
            await message.channel.send(`${data.firstName} ${data.lastName}`);
        } else if (currentChannelState === CommandState.None) {
            await message.channel.send("Enter first name");
            await this.cachingService.set(channelStateKey, CommandState.SetFirstName);
        } else if (currentChannelState == CommandState.SetFirstName) {
            const data = await this.persistentCachingService.getOrAdd<Data>(dataKey, {});
            data.firstName = message.content;
            await this.persistentCachingService.set(dataKey, data);

            await message.channel.send("Enter last name");
            await this.cachingService.set(channelStateKey, CommandState.SetLastName);
        } else if (currentChannelState == CommandState.SetLastName) {
            const data = await this.persistentCachingService.getOrAdd<Data>(dataKey, {});
            data.lastName = message.content;
            await this.persistentCachingService.set(dataKey, data);

            await message.channel.send("Now type `sayName`!");
            await this.cachingService.set(channelStateKey, CommandState.None);
            await this.persistentCachingService.set(guildNameStateKey, GuildNameState.Set);
        }
    }

    private getMemberScopedIndex(message: Message): Index {
        return this.index.addScope(message.member.id);
    }

    private getMemberChannelScopedIndex(message: Message): Index {
        return this.getMemberScopedIndex(message).addScope(message.channel.id);
    }
}

/** @ignore */
class Keys {
    static CommandState = "CommandState";
    static GuildNameState = "GuildNameState";
    static Data = "Data";
}

/** @ignore */
declare type Data = {
    firstName?: string;
    lastName?: string;
};

/** @ignore */
enum CommandState {
    None,
    SetFirstName,
    SetLastName
}

/** @ignore */
enum GuildNameState {
    NotSet,
    Set
}
