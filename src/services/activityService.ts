import { ActivityOptions, ActivityType, Client } from "discord.js";
import { selectRandom } from "../utils";

type ActivityChoices = {
    activity: ActivityType;
    options: Array<string>;
};

const CHOICES: Array<ActivityChoices> = [
    {
        activity: "WATCHING",
        options: ["you", `nothing, don't worry about it!`]
    },
    {
        activity: "PLAYING",
        options: ["Starcraft 6", "Starfox 65"]
    }
];

export class ActivityService {
    private currentActivity: ActivityOptions = null;

    constructor() {
        this.currentActivity = this.newActivity();
    }

    initializeInterval(client: Client): void {
        setInterval(async () => {
            // client.user.setActivity(this.newActivity());
            await client.user.setActivity(null);
        }, 5000);
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
