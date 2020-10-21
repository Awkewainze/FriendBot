/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
/** A value which must be able to be serialized via JSON. */
declare type JsonSerializable =
    | boolean
    | number
    | string
    | null
    | Array<JsonSerializable>
    | { [key: string]: JsonSerializable };

/** A value which must be able to be serialized via JSON. */
declare type IsJsonSerializable<T> = [Extract<T, Function>] extends [never]
    ? T extends boolean | number | string | null
        ? T
        : T extends Array<infer U>
        ? Array<IsJsonSerializable<U>>
        : T extends Record<string, unknown>
        ? { [P in keyof T]: IsJsonSerializable<T[P]> }
        : never
    : never;
