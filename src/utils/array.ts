/**
 * Randomize array in-place using Durstenfeld shuffle algorithm
 * @param array Array to shuffle. Happens in place, so clone if you don't want to lose original order.
 * @typeParam T Type of values stored in the array.
 * @category Array
 */
export function shuffle<T>(array: Array<T>): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

/**
 * Check if arrays are fully equal.
 * @param a Left array.
 * @param b Right array.
 * @typeParam T Type of values stored in the arrays.
 * @category Array
 */
export function arraysEqual<T>(a: Array<T>, b: Array<T>): boolean {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);
}

/**
 * Insert a value into a sorted array without having to fully re-sort.
 * @param array Array to add item into.
 * @param item Item to add into the array.
 * @param getIndex Method that converts the item into a sortable index (number).
 * @category Array
 */
export function insertInSortedLocation<T>(array: Array<T>, item: T, getIndex: (item: T) => number): void {
    const index = sortedIndex(array.map(getIndex), getIndex(item));
    array.splice(index, 0, item);
}

/** @ignore */
function sortedIndex(array: Array<number>, value: number): number {
    let low = 0;
    let high = array.length;

    while (low < high) {
        const mid = (low + high) >>> 1;
        if (array[mid] < value) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    return low;
}

/**
 * Takes in an array of arrays and tries to find a unique value from as many arrays as possible,
 * prioritizing keeping earlier values without falling back to {@link defaultValuesToUse}.
 * This function is a bit hard to describe, but you can look in the tests for examples.
 *
 * !(DANGER) This method is very expensive, I'm sure it could be better optimized to use more memory,
 * !(DANGER) but I only plan on using it for small arrays, be careful!
 * @param valueArrays Arrays to flatten into unique values.
 * @param defaultValuesToUse Values to use if it is not possible to find a value for output array.
 * @param stopOnUnresolvable If `false`, places `undefined` into output array when no other value can be found.
 * If `true`, will just return current array, this is usually more useful if you have {@link defaultValuesToUse}
 * has all expected values and want to stop once those run out.
 * @typeParam T Types of values in the sub arrays.
 */
export function getUniques<T>(
    valueArrays: Array<Array<T>>,
    defaultValuesToUse: Array<T> = [],
    stopOnUnresolvable = false
): Array<T> {
    const defaultValues = new Set<T>(defaultValuesToUse);
    const uniques: Array<T> = [];
    for (const subArrayIndex in valueArrays) {
        let found = false;
        for (const value of valueArrays[subArrayIndex]) {
            if (!uniques.includes(value)) {
                defaultValues.delete(value);
                uniques.push(value);
                found = true;
                break;
            }
        }

        if (!found) {
            // If haven't found, backtrack through previous subarray for one willing to swap.
            for (let i = ((subArrayIndex as unknown) as number) - 1; i >= 0; i--) {
                const currentValue = uniques[i];
                const currentUnusedAvailable = valueArrays[i].filter(x => !uniques.includes(x));
                const canBeSwapped =
                    valueArrays[subArrayIndex].includes(currentValue) && currentUnusedAvailable.length > 0;
                if (canBeSwapped) {
                    const valueToReplaceCurrentWith = currentUnusedAvailable[0];
                    defaultValues.delete(valueToReplaceCurrentWith);
                    uniques.splice(i, 1, valueToReplaceCurrentWith);
                    uniques.push(currentValue);
                    found = true;
                    break;
                }
            }
        }

        if (!found && defaultValues.size > 0) {
            const key = defaultValues.keys().next().value;
            defaultValues.delete(key);
            uniques.push(key);
            found = true;
        }

        if (!found && stopOnUnresolvable) {
            return uniques;
        }

        if (!found) {
            uniques.push(undefined);
        }
    }

    return uniques;
}
