import { GuildMember } from "discord.js";
import { BaseColor } from "./colors";
import { Preconditions } from "./preconditions";
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
        if (Preconditions.isNotNull(pronounInfo)) {
            value.pronouns.push(pronounInfo);
        }
        if (Preconditions.isNotNull(color)) {
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
