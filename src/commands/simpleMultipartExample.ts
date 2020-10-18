import { Message } from "discord.js";
import { inject, injectable } from "tsyringe";
import {
    CachingService,
    GuildAndMemberScopedIndex,
    GuildMemberAndChannelScopedIndex,
    Index,
    PersistentCachingService
} from "../services";
import { StatefulCommand } from "./statefulCommand";

type State = {
    step: Step;
    firstName: string;
};

type PersistentState = {
    nameSet: boolean;
    name: string;
};

/** This is the more complicated and more direct way of setting state, look at {@link SimpleMultipartExample} for simpler way. */
@injectable()
export class SimpleMultipartExampleCommand extends StatefulCommand<State, PersistentState> {
    constructor(
        @inject("CachingService") cachingService: CachingService,
        @inject("PersistentCachingService") persistentCachingService: PersistentCachingService,
        @inject(GuildAndMemberScopedIndex) private readonly guildAndMemberScopedIndex: Index,
        @inject(GuildMemberAndChannelScopedIndex) private readonly guildMemberAndChannelScopedIndex: Index
    ) {
        super(
            cachingService,
            persistentCachingService,
            { step: Step.None, firstName: "" },
            { nameSet: false, name: "" }
        );
        this.guildAndMemberScopedIndex = this.guildAndMemberScopedIndex.addScope("SimpleMultipartExample");
        this.guildMemberAndChannelScopedIndex = this.guildMemberAndChannelScopedIndex.addScope(
            "SimpleMultipartExample"
        );
    }
    async check(message: Message): Promise<boolean> {
        return (
            /^(sayName|setName)$/i.test(message.content) ||
            (await this.getState(this.guildMemberAndChannelScopedIndex)).step !== Step.None
        );
    }
    async execute(message: Message): Promise<void> {
        const currentState = await this.getState(this.guildMemberAndChannelScopedIndex);
        if (currentState.step === Step.SetFirstName) {
            await this.setState(this.guildMemberAndChannelScopedIndex, {
                firstName: message.content,
                step: Step.SetLastName
            });
            await message.channel.send("Enter last name");
            return;
        }
        if (currentState.step === Step.SetLastName) {
            await this.setState(this.guildMemberAndChannelScopedIndex, {
                step: Step.None
            });
            const state = await this.getState(this.guildMemberAndChannelScopedIndex);
            await this.setPersistentState(this.guildAndMemberScopedIndex, {
                name: `${state.firstName} ${message.content}`,
                nameSet: true
            });
            await message.channel.send("Type `sayName`");
            return;
        }

        if (/^sayName$/i.test(message.content)) {
            const currentPersistentState = await this.getPersistentState(this.guildAndMemberScopedIndex);
            if (currentPersistentState.nameSet) {
                await message.channel.send(currentPersistentState.name);
            }
            return;
        }

        if (/^setName$/i.test(message.content)) {
            await this.setPersistentState(this.guildAndMemberScopedIndex, { nameSet: false });
            await this.setState(this.guildMemberAndChannelScopedIndex, {
                step: Step.SetFirstName
            });
            await message.channel.send("Enter first name");
        }
    }
}

enum Step {
    None,
    SetFirstName,
    SetLastName
}
