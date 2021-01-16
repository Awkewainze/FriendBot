type State = {};
type PersistentState = {
    deletionDateTimeString: string;
    channelId: string;
    roleId: string;
    creatorId: string;
};

// @command("CreateTemporaryChannel")
// export class CreateTemporaryChannelCommand extends StatefulCommand<State, PersistentState> {
//     constructor(
//         @inject("CachingService") cachingService: CachingService,
//         @inject("PersistentCachingService") persistentCachingService: PersistentCachingService,
//         @inject(GuildAndMemberScopedIndex) private readonly guildAndMemberScopedIndex: Index,
//         @inject(GuildMemberAndChannelScopedIndex) private readonly guildMemberAndChannelScopedIndex: Index
//     ) {
//         super(cachingService, persistentCachingService, {}, { deletionDateTimeString: "", channelId: "", roleId: "", creatorId: "" });
//         this.guildAndMemberScopedIndex = this.guildAndMemberScopedIndex.addScope("CreateTemporaryChannelCommand");
//         this.guildMemberAndChannelScopedIndex = this.guildMemberAndChannelScopedIndex.addScope(
//             "CreateTemporaryChannelCommand"
//         );
//     }
//     async check(message: Message): Promise<boolean> {
//         return /^tempchannel/i.test(message.content);
//     }
//     async execute(message: Message): Promise<void> {
//         const parsed = /^tempchannel\s+(?<channelType>text|voice)\s+(?<channelName>[^\s]+)\s+(?<durationNumber>\d+)\s*(?<duration>m(ins?)?|h(ours?)?|days?)/i.exec(
//             message.content
//         )?.groups;
//         if (Check.isNotNull(parsed)) {
//             const channelType = parsed.channelType.toLowerCase() as "text" | "voice";
//             const channelName = parsed.channelName;
//             const channelDuration = LuxonDuration.
//                 parseInt(parsed.durationNumber),
//                 parsed.duration as moment.unitOfTime.DurationConstructor
//             );

//             const newRole = await message.guild.roles.create({
//                 data: {
//                     name: `${channelName}-role`
//                 }
//             });
//             message.guild.channels.create(channelName, {
//                 type: channelType
//             });
//         }
//     }
// }
