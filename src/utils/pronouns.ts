/**
 * Pronouns enum.
 * @category Pronouns
 */
export enum Pronouns {
    FEMININE,
    MASCULINE,
    NEUTRAL,
    NAME
}

/**
 * Handler for retrieving pronouns based on usage.
 * @category Pronouns
 */
export abstract class PronounInfo {
    protected readonly _name: string;
    constructor(name: string) {
        this._name = name;
    }
    /** Name. */
    get name(): string {
        return this._name;
    }
    /** Examples: "Derek's" "Iris'" */
    get possessiveName(): string {
        return this._name.endsWith("s") ? this._name + "'" : this._name + "'s";
    }
    /**
     * Determines surrounding adverbs.
     * Examples:
     *      Singular - "He *was*"
     *      Plural - "They *were*"
     */
    get plural(): boolean {
        return false;
    }
    /** Examples: "She/Her" "They/Them" */
    get pronounDisplayName(): string {
        return `${this.subjective}/${this.objective}`;
    }
    /** Examples: "She" "He" "They" */
    abstract get subjective(): string;
    /** Examples: "Her" "Him" "Them" */
    abstract get objective(): string;
    /** Examples: "Her" "His" "Their" */
    abstract get possessiveDeterminer(): string;
    /** Examples: "Hers" "His" "Theirs" */
    abstract get possessivePronoun(): string;
    /** Examples: "Herself" "Himself" "Themself" */
    abstract get reflexive(): string;
    /** Gets {@link Pronouns} enum. */
    abstract get pronounsEnum(): Pronouns;
    /**
     * Get pronoun info object based on role string.
     * @param name Name to refer user by.
     * @param role Role to parse and check string for matching pronoun definitions.
     */
    static getFromRole(name: string, role: string): PronounInfo | null {
        if (/^(?=.*\bshe\b)(?=.*\bher\b).*$/i.test(role)) {
            return new FemininePronouns(name);
        }
        if (/^(?=.*\bhe\b)(?=.*\bhim\b).*$/i.test(role)) {
            return new MasculinePronouns(name);
        }
        if (/^(?=.*\bthey\b)(?=.*\bthem\b).*$/i.test(role)) {
            return new NeutralPronouns(name);
        }
        if (/^use.*my.*name$/i.test(role)) {
            return new NameAsPronouns(name);
        }

        return null;
    }

    /**
     * Get pronoun info object based on enum.
     * @param name Name to refer user by.
     * @param pronouns Enum to use for returning info.
     */
    static getFromPronounsEnum(name: string, pronouns: Pronouns): PronounInfo {
        switch (pronouns) {
            case Pronouns.FEMININE:
                return new FemininePronouns(name);
            case Pronouns.MASCULINE:
                return new MasculinePronouns(name);
            case Pronouns.NEUTRAL:
                return new NeutralPronouns(name);
            case Pronouns.NAME:
                return new NameAsPronouns(name);
        }
    }
}

/** @ignore */
class FemininePronouns extends PronounInfo {
    constructor(name: string) {
        super(name);
    }
    get subjective(): string {
        return "She";
    }
    get objective(): string {
        return "Her";
    }
    get possessiveDeterminer(): string {
        return "Her";
    }
    get possessivePronoun(): string {
        return "Hers";
    }
    get reflexive(): string {
        return "Herself";
    }
    get pronounsEnum(): Pronouns {
        return Pronouns.FEMININE;
    }
}

/** @ignore */
class MasculinePronouns extends PronounInfo {
    constructor(name: string) {
        super(name);
    }
    get subjective(): string {
        return "He";
    }
    get objective(): string {
        return "Him";
    }
    get possessiveDeterminer(): string {
        return "His";
    }
    get possessivePronoun(): string {
        return "His";
    }
    get reflexive(): string {
        return "Himself";
    }
    get pronounsEnum(): Pronouns {
        return Pronouns.MASCULINE;
    }
}

/** @ignore */
class NeutralPronouns extends PronounInfo {
    constructor(name: string) {
        super(name);
    }
    get plural(): boolean {
        return true;
    }
    get subjective(): string {
        return "They";
    }
    get objective(): string {
        return "Them";
    }
    get possessiveDeterminer(): string {
        return "Their";
    }
    get possessivePronoun(): string {
        return "Theirs";
    }
    get reflexive(): string {
        return "Themself";
    }
    get pronounsEnum(): Pronouns {
        return Pronouns.NEUTRAL;
    }
}

/** @ignore */
class NameAsPronouns extends PronounInfo {
    constructor(name: string) {
        super(name);
    }
    get pronounDisplayName(): string {
        return "Use my name";
    }
    get subjective(): string {
        return this.name;
    }
    get objective(): string {
        return this.name;
    }
    get possessiveDeterminer(): string {
        return this.name;
    }
    get possessivePronoun(): string {
        return this.possessiveName;
    }
    get reflexive(): string {
        return this.name;
    }
    get pronounsEnum(): Pronouns {
        return Pronouns.NAME;
    }
}
