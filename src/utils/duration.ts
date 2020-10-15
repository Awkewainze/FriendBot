/**
 * Translate times between each other easier for cleaner code. I.e. `Duration.fromMinutes(27).toSeconds();`
 * !(DANGER) This should not be used with real Dates. In the real world, not every day has 24 hours, and time is weird. This is just a simple abstraction.
 */
export class Duration {
    private constructor(private readonly milliseconds: number) {}
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
}
