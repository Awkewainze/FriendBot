import { ActivityOptions, ActivityType, Client } from "discord.js";
import { selectRandom } from "../utils";

type ActivityChoices = {
    activity: ActivityType;
    options: Array<string>;
};

const CHOICES: Array<ActivityChoices> = [
    {
        activity: "WATCHING",
        options: [
            "you... FROM INSIDE THE HOUSE",
            "Jan Quadrant Vincent 16",
            "Adventures of Baby Legs and Regular Legs",
            "Avatar 86: This Time The Trees Are Real Mad",
            "Seinfeld with Abyssal dub"
        ]
    },
    {
        activity: "PLAYING",
        options: [
            "Starcraft 6",
            "Starfox 65",
            "Phasmophob - OH SHIT HIDE",
            "Bird Law Simulator 2037",
            "Call Of Dookie",
            "Sturgeon Simulator",
            "Untitled Spruce Game"
        ]
    },
    {
        activity: "LISTENING",
        options: ["Nefertiti's Fjord", "We Didn't Start The Fire, but at 50% speed", "John Malkovich gurgling marbles"]
    },
    {
        activity: "STREAMING",
        options: ["a literal stream", "ice cubes melting in the sun", "my neighbor napping in a hammock"]
    }
];

export class ActivityService {
    private currentActivity: ActivityOptions = null;

    constructor() {
        this.currentActivity = this.newActivity();
    }

    initializeActivityTimeout(client: Client): void {
        setTimeout(async () => {
            await client.user.setActivity(this.newActivity());

            this.initializeActivityTimeout(client);
        }, this.generateRandomTimeout());
    }

    generateRandomTimeout(): number {
        // At least fifteen minutes between updates
        const floor = 15;
        const randomDuration = Math.round(Math.random() * 25);

        if (randomDuration < floor) {
            return this.generateRandomTimeout();
        }

        return 1000 * 3;

        // return 1000 * 60 * randomDuration;
    }

    getCurrentActivity(): ActivityOptions {
        return this.currentActivity;
    }

    isCurrentActivity(activity: ActivityType, name: string): boolean {
        if (this.getCurrentActivity() === null) {
            return false;
        }

        const currentActivity: ActivityOptions = this.getCurrentActivity();

        return currentActivity.type === activity && currentActivity.name === name;
    }

    newActivity(): ActivityOptions | null {
        const activityOptions: ActivityChoices = selectRandom(CHOICES);
        const name: string = selectRandom(activityOptions.options);

        if (this.isCurrentActivity(activityOptions.activity, name)) {
            return this.newActivity();
        }

        this.currentActivity = {
            name: name,
            type: activityOptions.activity,
            url: "https://github.com/Awkewainze/FriendBot"
        };

        return this.currentActivity;
    }
}
