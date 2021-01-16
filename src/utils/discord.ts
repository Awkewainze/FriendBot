import { GuildMember } from "discord.js";
import { Check } from "./check";
import { BaseColor } from "./colors";
import { PronounInfo, Pronouns } from "./pronouns";

/** Some extra info alongside the GuildMember, like info that is extracted from roles. */
export type MemberWithExtraInfo = {
    /** Underlying [GuildMember](https://discord.js.org/#/docs/main/stable/class/GuildMember). */
    member: GuildMember;
    /** Name to use for referencing user, tries to use nickname, falls back to user name. */
    name: string;
    /** Pronouns member uses, this will always have at least 1 value (They/Them being the default). */
    pronouns: Array<PronounInfo>;
    /** Colors user has selected, may be empty. */
    colors: Array<BaseColor>;
};

/**
 * Gets some extra info for this user.
 * @param member Member to get extra info for.
 */
export function getExtraInfo(member: GuildMember): MemberWithExtraInfo {
    const value: MemberWithExtraInfo = {
        name: member.nickname || member.user.username,
        member,
        pronouns: [],
        colors: []
    };
    for (const key of member.roles.cache.keyArray()) {
        const role = member.roles.cache.get(key);
        const pronounInfo = PronounInfo.getFromRole(value.name, role.name);
        const color = BaseColor.getColorFromRole(role.name);
        if (Check.isNotNull(pronounInfo)) {
            value.pronouns.push(pronounInfo);
        }
        if (Check.isNotNull(color)) {
            value.colors.push(color);
        }
    }

    if (value.pronouns.length === 0) {
        value.pronouns.push(PronounInfo.getFromPronounsEnum(value.name, Pronouns.NEUTRAL));
    }

    return value;
}

/**
 * Removes quotes from a message (lines that begin with `>`). This is useful for making sure not to double execute commands within a quote.
 * @param message Message to remove quotes from (lines that begin with `>`).
 * @returns The given message without quotes.
 */
export function stripQuotes(message: string): string {
    return message
        .split("\n")
        .filter(x => !x.startsWith(">"))
        .join("\n");
}

/** @ignore */
declare type StaticEmoji = {
    name: string;
    snowflake: string;
};

/** A collection of useable emojis by the bot. */
export class Emojis {
    static get Red(): StaticEmoji {
        return {
            name: "red",
            snowflake: "761513028994465792"
        };
    }
    static get Orange(): StaticEmoji {
        return {
            name: "orange",
            snowflake: "761568194971959317"
        };
    }
    static get Yellow(): StaticEmoji {
        return {
            name: "yellow",
            snowflake: "761568298961338369"
        };
    }
    static get Green(): StaticEmoji {
        return {
            name: "green",
            snowflake: "761568153637093437"
        };
    }
    static get Blue(): StaticEmoji {
        return {
            name: "blue",
            snowflake: "761513078499967036"
        };
    }
    static get Purple(): StaticEmoji {
        return {
            name: "purple",
            snowflake: "761568553480355870"
        };
    }
    static get Pink(): StaticEmoji {
        return {
            name: "pink",
            snowflake: "761568242908135467"
        };
    }
    static get SkipVote(): StaticEmoji {
        return {
            name: "skipvote",
            snowflake: "765852438716350484"
        };
    }
    static get Howdy(): StaticEmoji {
        return {
            name: "howdy",
            snowflake: "777399898310967317"
        };
    }

    static get PositiveReactionCharacters(): Array<string> {
        return ["😍", "🤩", "❤️", "💕", "😻"];
    }
}
