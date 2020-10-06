import { getUniques } from "./array";

/**
 * Color enum.
 * @category Color
 */
export enum Color {
    Red,
    Orange,
    Yellow,
    Green,
    Blue,
    Purple,
    Pink
}

/**
 * Base class for Color classes, and also factory for providing inherited classes.
 * @category Color
 */
export abstract class BaseColor {
    /**
     * Get the Among Us emoji with matching color.
     * @returns The emoji snowflake.
     */
    abstract getAmongUsDefaultEmojiSnowflake(): string;
    /**
     * Get the name of this color as a string.
     * @returns The string.
     */
    abstract getString(): string;
    /**
     * Get this color as it's {@link Color} enum.
     * @returns The {@link Color} enum.
     */
    abstract getColorEnum(): Color;

    /**
     * Parses a role string and tries to return an implementation of {@link BaseColor} from it.
     * @param role Role string to parse and return corresponding implementation of {@link BaseColor}.
     * @return An implementation of {@link BaseColor}, or null, if no value found.
     */
    static getColorFromRole(role: string): BaseColor | null {
        const color = /\b(?<color>red|orange|yellow|green|blue|purple|pink)\b/i
            .exec(role)
            ?.groups?.color?.toLowerCase();
        if (!color) return null;

        switch (color) {
            case "red":
                return new Red();
            case "orange":
                return new Orange();
            case "yellow":
                return new Yellow();
            case "green":
                return new Green();
            case "blue":
                return new Blue();
            case "purple":
                return new Purple();
            case "pink":
                return new Pink();
        }

        return null;
    }

    /**
     * Returns an implementation of the {@link BaseColor} object from {@link Color} enum.
     * @param color {@link Color} to return corresponding implementation of {@link BaseColor}.
     * @return An implementation of {@link BaseColor}.
     */
    static getColor(color: Color): BaseColor {
        switch (color) {
            case Color.Red:
                return new Red();
            case Color.Orange:
                return new Orange();
            case Color.Yellow:
                return new Yellow();
            case Color.Green:
                return new Green();
            case Color.Blue:
                return new Blue();
            case Color.Purple:
                return new Purple();
            case Color.Pink:
                return new Pink();
        }
    }
}

/** @ignore */
class Red extends BaseColor {
    getAmongUsDefaultEmojiSnowflake(): string {
        return "761513028994465792";
    }
    getString(): string {
        return "Red";
    }
    getColorEnum(): Color {
        return Color.Red;
    }
}

/** @ignore */
class Orange extends BaseColor {
    getAmongUsDefaultEmojiSnowflake(): string {
        return "761568194971959317";
    }
    getString(): string {
        return "Orange";
    }
    getColorEnum(): Color {
        return Color.Orange;
    }
}

/** @ignore */
class Yellow extends BaseColor {
    getAmongUsDefaultEmojiSnowflake(): string {
        return "761568298961338369";
    }
    getString(): string {
        return "Yellow";
    }
    getColorEnum(): Color {
        return Color.Yellow;
    }
}

/** @ignore */
class Green extends BaseColor {
    getAmongUsDefaultEmojiSnowflake(): string {
        return "761568153637093437";
    }
    getString(): string {
        return "Green";
    }
    getColorEnum(): Color {
        return Color.Green;
    }
}

/** @ignore */
class Blue extends BaseColor {
    getAmongUsDefaultEmojiSnowflake(): string {
        return "761513078499967036";
    }
    getString(): string {
        return "Blue";
    }
    getColorEnum(): Color {
        return Color.Blue;
    }
}

/** @ignore */
class Purple extends BaseColor {
    getAmongUsDefaultEmojiSnowflake(): string {
        return "761568553480355870";
    }
    getString(): string {
        return "Purple";
    }
    getColorEnum(): Color {
        return Color.Purple;
    }
}

/** @ignore */
class Pink extends BaseColor {
    getAmongUsDefaultEmojiSnowflake(): string {
        return "761568242908135467";
    }
    getString(): string {
        return "Pink";
    }
    getColorEnum(): Color {
        return Color.Pink;
    }
}

/**
 * Will get an array of non duplicate colors, attempting to prioritize early indices and prefer
 * using colors in provided array. See {@link getUniques} and it's tests for more info.
 * If a sub array is out of colors, will see if a previous array is willing to switch colors so both can be valid.
 * If not possible, will chose a random color instead.
 * If there are no more colors left, will delete the rest of the array.
 * @param colors Array of {@link Color}s to ensure there are no duplicates,
 * each sub array representing an acceptable color for use in array.
 * If none are left in array, a random color will be chosen instead.
 * @returns An array of unique {@link Color}s, best matching possible.
 * @category Color
 */
export function makeUniqueColors(colors: Array<Array<Color>>): Array<Color> {
    return getUniques(
        colors,
        [Color.Red, Color.Orange, Color.Yellow, Color.Green, Color.Blue, Color.Purple, Color.Pink],
        true
    );
}
