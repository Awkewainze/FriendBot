import * as fs from "fs";
import * as path from "path";
import { selectRandom } from "./math";
import { Preconditions } from "./preconditions";

/**
 * Chooses a random files from a directory (with optional regex pattern), throws error if no files exist.
 * @param directory Folder path to search through for random file.
 * @param regex Filter for which files to return.
 * @returns The found file path, if it exists.
 * @category File
 */
export async function getRandomFileFromDir(directory: string, regex?: RegExp): Promise<string> {
    Preconditions.checkNotNull(directory);
    let files: Array<string> = await new Promise((resolve, reject) => {
        fs.readdir(directory, (err, files) => {
            if (err) return reject(err);
            resolve(files);
        });
    });

    if (Preconditions.isNotNull(regex)) {
        files = files.filter(file => regex.test(file));
    }

    Preconditions.checkPositive(files.length, "No matching files in folder");
    return path.join(directory, selectRandom(files));
}

/**
 * Gets the path to the media directory.
 * @returns The path to media directory.
 * @category File
 */
export function getMediaDir(): string {
    return path.join(__dirname, "..", "..", "media");
}
