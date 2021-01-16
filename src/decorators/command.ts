// export function command(constructor: Function) {
//     Object.seal(constructor);
//     Object.seal(constructor.prototype);
// }

// import { Index } from "../services";

// export function command<T extends { new (...args: Array<unknown>): unknown }>(commandName: string): (target: T) => T {
//     return (target: T) => {
//         // save a reference to the original constructor
//         const original = target;

//         // the new constructor behavior
//         const newConstructor = function (...args: Array<unknown>) {
//             const newArgs = args.map(x => {
//                 if (x instanceof Index) {
//                     return x.addScope(commandName);
//                 }
//                 return x;
//             });
//             return new original(...newArgs) as T;
//         };

//         // copy prototype so instanceof operator still works
//         newConstructor.prototype = original.prototype;

//         // return new constructor (will override original)
//         return newConstructor;
//     };
// }
