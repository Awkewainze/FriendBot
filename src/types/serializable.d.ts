/** A value which must be able to be serialized via JSON. */
declare type JsonSerializable =
    | boolean
    | number
    | string
    | null
    | Array<JsonSerializable>
    | { [key: string]: JsonSerializable };
