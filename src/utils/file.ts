import * as fs from "fs";
import * as path from "path";
import { Check } from "./check";
import { selectRandom } from "./math";

/**
 * Chooses a random files from a directory (with optional regex pattern), throws error if no files exist.
 * @param directory Folder path to search through for random file.
 * @param regex Filter for which files to return.
 * @returns The found file path, if it exists.
 * @category File
 */
export async function getRandomFileFromDir(directory: string, regex?: RegExp): Promise<string> {
    Check.verifyNotNull(directory);
    let files: Array<string> = await new Promise((resolve, reject) => {
        fs.readdir(directory, (err, files) => {
            if (err) return reject(err);
            resolve(files);
        });
    });

    if (Check.isNotNull(regex)) {
        files = files.filter(file => regex.test(file));
    }

    Check.verifyPositive(files.length, "No matching files in folder");
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
