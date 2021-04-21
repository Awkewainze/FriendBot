import { Duration as LuxonDuration } from "luxon";
import { Check } from "./check";
import { randInt } from "./math";

/**
 * Translate times between each other easier for cleaner code. I.e. `Duration.fromMinutes(27).toSeconds();`
 * !(DANGER) This should not be used with real Dates. In the real world, not every day has 24 hours, and time is weird. This is just a simple abstraction.
 * If you want real time adding on Dates, use Luxon directly.
 *
 * Can be used for simple conversions, I recommend going from bigger to smaller because of floating point errors though i.e. `Duration.fromDays().toSeconds();`
 * I also recommend checking {@link isForever} for unique cases.
 */
export class Duration {
    private constructor(private readonly milliseconds: number, private readonly forever: boolean = false) {
        if (this.forever) {
            this.milliseconds = Number.POSITIVE_INFINITY;
        }
    }
    toMilliseconds(): number {
        return this.milliseconds;
    }
    toSeconds(): number {
        return this.milliseconds / 1000;
    }
    toMinutes(): number {
        return this.toSeconds() / 60;
    }
    toHours(): number {
        return this.toMinutes() / 60;
    }
    toDays(): number {
        return this.toHours() / 24;
    }
    isForever(): boolean {
        return this.forever;
    }
    toLuxonDuration(): LuxonDuration {
        return LuxonDuration.fromMillis(this.toMilliseconds());
    }
    add(duration: Duration): Duration {
        return new Duration(this.milliseconds + duration.toMilliseconds(), this.forever || duration.forever);
    }
    multiply(times: number): Duration {
        return new Duration(this.milliseconds * times, this.forever);
    }
    static fromMilliseconds(milliseconds: number): Duration {
        Check.verifyNotNegative(milliseconds, "Duration must be positive");
        return new Duration(milliseconds);
    }
    static fromSeconds(seconds: number): Duration {
        Check.verifyNotNegative(seconds, "Duration must be positive");
        return new Duration(seconds * 1000);
    }
    static fromMinutes(minutes: number): Duration {
        Check.verifyNotNegative(minutes, "Duration must be positive");
        return this.fromSeconds(minutes * 60);
    }
    static fromHours(hours: number): Duration {
        Check.verifyNotNegative(hours, "Duration must be positive");
        return this.fromMinutes(hours * 60);
    }
    static fromDays(days: number): Duration {
        Check.verifyNotNegative(days, "Duration must be positive");
        return this.fromHours(days * 24);
    }
    static fromLuxonDuration(duration: LuxonDuration): Duration {
        Check.verify(duration.isValid, "Duration must be valid");
        return this.fromMilliseconds(duration.milliseconds);
    }
    static forever(): Duration {
        return new Duration(0, true);
    }
    static between(a: Duration, b: Duration): Duration {
        if (a.isForever() && b.isForever()) return Duration.forever();

        const left = a.isForever() ? Number.MAX_SAFE_INTEGER : a.toMilliseconds();
        const right = b.isForever() ? Number.MAX_SAFE_INTEGER : b.toMilliseconds();

        if (left < right) {
            return Duration.fromMilliseconds(randInt(right - left) + left);
        }
        if (right < left) {
            return Duration.fromMilliseconds(randInt(left - right) + right);
        }

        return a;
    }
}
