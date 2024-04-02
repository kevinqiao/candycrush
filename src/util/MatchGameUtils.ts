import { CellItem } from '../model/CellItem';
import { GAME_GOAL } from '../model/Match3Constants';
import candy_textures from '../model/candy_textures';
import { MatchItem } from '../service/GameEngine';
import * as Utils from "./Utils";
export const checkSwipe = (grid: CellItem[][]): boolean => {
    const rows = grid.length;
    const columns = grid[0].length;
    for (let row = 0; row < rows; row++) {
        let col = 0;
        let start = grid[row][0];
        let units: CellItem[] = [];
        while (col < columns) {
            if (!grid[row][col])
                console.log("row:" + row + ";col:" + col + " is null")
            if (grid[row][col].asset === start.asset) {
                units.push(grid[row][col])
            } else {
                if (units.length >= 3) {
                    return true;
                }
                start = grid[row][col]
                units = [start]
            }
            col++; // Move to the next column if no match was found
        }
        if (units.length >= 3) {
            return true
        }
    }

    for (let col = 0; col < columns; col++) {
        let row = 0;
        let start = grid[0][col];
        let units: CellItem[] = [];
        while (row < rows) {
            // console.log(col + "," + row + ";" + grid[row][col].asset + ":" + start.asset + ":" + units.length)
            if (grid[row][col].asset === start.asset) {
                units.push(grid[row][col])
            } else {
                if (units.length >= 3) {
                    return true;
                }
                start = grid[row][col]
                units = [start]
            }
            row++; // Move to the next column if no match was found
        }
        if (units.length >= 3) {
            return true;
        }
    }

    return false;
}
export const hasMatch = (grid: CellItem[][]): boolean => {
    let matched = false;
    const rows = grid.length;
    const columns = grid[0].length;
    for (let row = 0; row < rows; row++) {
        let col = 0;
        let start = grid[row][0];
        let units: CellItem[] = [];
        while (col < columns) {
            // if (!grid[row][col])
            //     console.log("row:" + row + ";col:" + col + " is null")
            if (grid[row][col].asset === start.asset) {
                units.push(grid[row][col])
                if (units.length >= 3) {
                    matched = true;
                    break;
                }
            } else {
                start = grid[row][col]
                units = [start]
            }
            col++; // Move to the next column if no match was found
        }
        if (units.length >= 3) {
            matched = true;
            break;
        }
    }

    for (let col = 0; col < columns; col++) {
        let row = 0;
        let start = grid[0][col];
        let units: CellItem[] = [];
        while (row < rows) {
            // console.log(col + "," + row + ";" + grid[row][col].asset + ":" + start.asset + ":" + units.length)
            if (grid[row][col].asset === start.asset) {
                units.push(grid[row][col])
                if (units.length >= 3) {
                    matched = true;
                    break;
                }
            } else {
                start = grid[row][col]
                units = [start]
            }
            row++; // Move to the next column if no match was found
        }
        if (matched) break;
        if (units.length >= 3) {
            matched = true;
            break;
        }
    }

    return matched;
}

export const hasMatch3 = (grid: CellItem[][]): boolean => {

    const rows = grid.length;
    const columns = grid[0].length;
    for (let row = 0; row < rows; row++) {
        const units: CellItem[] = [];
        for (let col = 0; col < columns; col++) {
            units.push(grid[row][col])
            if (col === columns - 1 || grid[row][col].asset !== grid[row][col + 1].asset) {
                if (units.length >= 3) return true;
                units.length = 0;
            }
        }
    }

    for (let col = 0; col < columns; col++) {
        const units: CellItem[] = [];
        for (let row = 0; row < rows; row++) {
            units.push(grid[row][col])
            if (row === rows - 1 || grid[row][col].asset !== grid[row + 1][col].asset) {
                if (units.length >= 3) return true;
                units.length = 0;
            }
        }
    }
    return false;
}
export const findMatch3 = (grid: CellItem[][]): MatchItem[] => {
    let id = 0;
    const rows = grid.length;
    const columns = grid[0].length;
    const matches: MatchItem[] = [];
    for (let row = 0; row < rows; row++) {
        const units: CellItem[] = [];
        for (let col = 0; col < columns; col++) {
            if (grid[row][col].status) continue;
            units.push(grid[row][col])
            if (col === columns - 1 || grid[row][col].asset !== grid[row][col + 1].asset || grid[row][col + 1].status) {
                if (units.length === 3) {
                    id++;
                    matches.push({ id, units: [...units], start: { row, column: units[0]['column'] }, end: { row, column: units[units.length - 1]['column'] }, orientation: "horizontal", size: units.length })
                }
                units.length = 0;
            }
        }
    }


    for (let col = 0; col < columns; col++) {
        const units: CellItem[] = [];
        for (let row = 0; row < rows; row++) {
            if (grid[row][col].status) continue;
            units.push(grid[row][col])
            if (row === rows - 1 || grid[row][col].asset !== grid[row + 1][col].asset || grid[row + 1][col].status) {
                if (units.length === 3) {
                    id++;
                    matches.push({ id, units: [...units], start: { row: units[0]['row'], column: col }, end: { row: units[units.length - 1]['row'], column: col }, orientation: "vertical", size: units.length })
                }
                units.length = 0;
            }
        }
    }
    return matches;
}
export const findMatch3Plus = (grid: CellItem[][]): MatchItem[] => {
    let id = 0;
    const rows = grid.length;
    const columns = grid[0].length;
    const matches: MatchItem[] = [];
    for (let row = 0; row < rows; row++) {
        const units: CellItem[] = [];
        for (let col = 0; col < columns; col++) {
            if (grid[row][col].status) continue;
            units.push(grid[row][col])
            if (col === columns - 1 || grid[row][col].asset !== grid[row][col + 1].asset || grid[row][col + 1].status) {
                if (units.length > 3) {
                    id++;
                    matches.push({ id, units: [...units], start: { row, column: units[0]['column'] }, end: { row, column: units[units.length - 1]['column'] }, orientation: "horizontal", size: units.length })
                }
                units.length = 0;
            }
        }
    }


    for (let col = 0; col < columns; col++) {
        const units: CellItem[] = [];
        for (let row = 0; row < rows; row++) {
            if (grid[row][col].status) continue;
            units.push(grid[row][col])
            if (row === rows - 1 || grid[row][col].asset !== grid[row + 1][col].asset || grid[row + 1][col].status) {
                if (units.length > 3) {
                    id++;
                    matches.push({ id, units: [...units], start: { row: units[0]['row'], column: col }, end: { row: units[units.length - 1]['row'], column: col }, orientation: "vertical", size: units.length })
                }
                units.length = 0;
            }
        }
    }
    return matches;
}



export const getFreeCandy = (seed: string, cellId: number) => {
    const random = Utils.getNthRandom(seed, cellId);
    // const index = Math.floor(random * (candy_textures.length - 10));
    const index = Math.floor(random * 10);
    const asset = candy_textures[index]["id"] ?? 0;
    const candy = { id: cellId, asset, column: -1, row: -1 };
    return candy
}
export const countBaseScore = (matched: { asset: number, quantity: number }[]): number => {
    if (matched)
        return matched.reduce((s: number, a: { asset: number; quantity: number }) => s + a.quantity, 0);
    return 0;
}

export const solveGoalChanges = (goalId: number, prematched: { asset: number, quantity: number }[], curmatched: { asset: number, quantity: number }[]): { asset: number, from: number, to: number }[] => {
    if (goalId) {
        const goalObj = GAME_GOAL.find((g) => g.id === goalId);
        if (goalObj) {
            const changes: { asset: number; from: number; to: number }[] = []
            for (const item of goalObj.goal) {
                const pre = prematched.find((a) => a.asset === item.asset);
                const cur = curmatched.find((a) => a.asset === item.asset);
                if (cur) {
                    let from = item.quantity;
                    if (pre)
                        from = Math.max(from - pre.quantity, 0);
                    const to = Math.max(item.quantity - cur.quantity, 0);
                    if (from > to)
                        changes.push({ asset: item.asset, from, to })
                }
            }
            return changes;
        }
    }
    return [];
}
