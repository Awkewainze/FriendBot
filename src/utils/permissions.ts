export enum Permission {
    /** Permission to explicitly inform clients that user has no permissions, not "yet to be generated" (default) permissions */
    None = "None",
    /** Minimum permission to be able to use any FriendBot commands */
    UseCommands = "UseCommands",
    ModifySelf = "ModifySelf",
    ModifyOtherTemporary = "ModifyOtherTemporary",
    ModifyOther = "ModifyOther",
    PlaySound = "PlaySound",
    CringeCash = "CringeCash",
    CringeCashAdmin = "CringeCashAdmin",
    ModifyBot = "ModifyBot",
    ModifyPermissions = "ModifyPermissions"
}

export const DefaultPermissions: ReadonlySet<Permission> = new Set<Permission>([
    Permission.UseCommands,
    Permission.ModifySelf,
    Permission.ModifyOtherTemporary,
    Permission.PlaySound,
    Permission.CringeCash
]);

export const AllPermissions: ReadonlySet<Permission> = new Set<Permission>(
    (Object.keys(Permission) as Array<Permission>).filter(x => x !== Permission.None)
);
