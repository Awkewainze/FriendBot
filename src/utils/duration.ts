/**
 * Translate times between each other easier for cleaner code. I.e. `Duration.fromMinutes(27).toSeconds();`
 * !(DANGER) This should not be used with real Dates. In the real world, not every day has 24 hours, and time is weird. This is just a simple abstraction.
 * If you want real time adding on Dates, use Moment or similar library.
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
    add(duration: Duration): Duration {
        return new Duration(this.milliseconds + duration.toMilliseconds(), this.forever || duration.forever);
    }
    multiply(times: number): Duration {
        return new Duration(this.milliseconds * times, this.forever);
    }
    static fromMilliseconds(milliseconds: number): Duration {
        return new Duration(milliseconds);
    }
    static fromSeconds(seconds: number): Duration {
        return new Duration(seconds * 1000);
    }
    static fromMinutes(minutes: number): Duration {
        return this.fromSeconds(minutes * 60);
    }
    static fromHours(hours: number): Duration {
        return this.fromMinutes(hours * 60);
    }
    static fromDays(days: number): Duration {
        return this.fromHours(days * 24);
    }
    static forever(): Duration {
        return new Duration(0, true);
    }
}
