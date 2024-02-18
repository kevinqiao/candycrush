import seedrandom from 'seedrandom';
export const getNthRandom = (seed: string, n: number): number => {
    const rng = seedrandom(seed);
    let value = 0;

    for (let i = 0; i < n; i++) {
        value = rng();
    }

    return value;
}
export const getRandomSeed = (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
export const getRandom = (max: number) => {
    return Math.floor(Math.random() * max);
}
// export const convertCellsToArray = (units: CellItem[]): CellItem[][] => {
//     // Determine the number of rows and columns
//     let maxRow = 0;
//     let maxColumn = 0;
//     for (const unit of units) {
//         maxRow = Math.max(maxRow, unit.row);
//         maxColumn = Math.max(maxColumn, unit.column);
//     }

//     // Initialize the two-dimensional array
//     const result: CellItem[][] = Array.from({ length: maxRow + 1 }, () => Array(maxColumn + 1).fill(null));

//     // Populate the two-dimensional array
//     for (const unit of units) {
//         result[unit.row][unit.column] = unit;
//     }

//     return result;
// }