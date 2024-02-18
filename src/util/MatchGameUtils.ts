import { CellItem } from '../model/CellItem';
import { CANDY_MATCH_TYPE } from '../model/Constants';
import { GAME_GOAL } from '../model/Match3Constants';
import candy_textures from '../model/candy_textures';
import { Match, MatchItem } from '../service/GameEngine';
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
export const findMatches = (grid: CellItem[][]): MatchItem[] => {

    const rows = grid.length;
    const columns = grid[0].length;
    const matches: MatchItem[] = [];
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
                    matches.push({ units: [...units], start: { row: start.row, column: start.column }, end: { row: row, column: col - 1 }, orientation: "horizontal" })
                }
                start = grid[row][col]
                units = [start]
            }
            col++; // Move to the next column if no match was found
        }
        if (units.length >= 3) {
            matches.push({ units: [...units], start: { row: start.row, column: start.column }, end: { row: row, column: col - 1 }, orientation: "horizontal" })
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
                    matches.push({ units: [...units], start: { row: start.row, column: start.column }, end: { row: row - 1, column: col }, orientation: "vertical" })
                }
                start = grid[row][col]
                units = [start]
            }
            row++; // Move to the next column if no match was found
        }
        if (units.length >= 3) {
            matches.push({ units: [...units], start: { row: start.row, column: start.column }, end: { row: row - 1, column: col }, orientation: "vertical" })
        }
    }

    return matches;
}

export const checkMatches = (grid: CellItem[][]): Match[] => {

    const allmatches: MatchItem[] = findMatches(grid);
    const matches4: Match[] = getMatchPlus4(allmatches);
    const specials: Match[] = getSpecials(allmatches);

    const matches3: MatchItem[] = allmatches.filter((m) => !m.status)
    const matches: Match[] = [];
    for (const m of matches3) {
        m.status = 1;
        m.units.forEach((u) => u.status = 1);
        matches.push({ type: CANDY_MATCH_TYPE.LINE, size: 3, items: [m] })
    }
    matches.push(...matches4);
    matches.push(...specials)
    return matches
}
export const getMatchPlus4 = (matches: MatchItem[]): Match[] => {
    const matches4: Match[] = [];
    let loop = true;
    while (loop) {
        const m4 = matches.filter((m) => !m.status && m.units.length >= 4).sort((a, b) => {
            return b.units.length - a.units.length
        })
        if (m4.length === 0) {
            loop = false;
            break;
        }
        for (const m of m4) {
            const ms: number[] = [];
            m.units.forEach((u, index) => {
                if (u.status)
                    ms.push(index)
            })
            if (ms.length > 0) {
                for (let i = 0; i < ms.length; i++) {
                    const len = ms[i + 1] - ms[i];
                    if (len >= 2) {
                        const units = m.units.slice(ms[i], ms[i + 1])
                        const item = {
                            units,
                            start: { row: units[0].row, column: units[0].column },
                            end: { row: units[len - 1].row, column: units[len - 1].column },
                            orientation: m.orientation
                        }
                        if (len === 2) {
                            matches.push(item)
                        } else {
                            item.units.forEach((u) => u.status = 1)
                            matches4.push({ type: CANDY_MATCH_TYPE.LINE, size: units.length, items: [item] });
                        }
                    }
                }
            } else {
                m.units.forEach((u) => u.status = 1)
                matches4.push({ type: CANDY_MATCH_TYPE.LINE, size: m.units.length, items: [m] });
            }
            m.status = 1;
        }
    }
    return matches4

}

export const getSpecials = (matches: MatchItem[]): Match[] => {
    const matches3: MatchItem[] = matches.filter((m) => {
        const us = m.units.filter((u) => u.status);
        if (!m.status && us.length === 0 && m.units.length === 3)
            return true;
        else
            return false;
    })
    const specials: Match[] = [];
    const vmatches: MatchItem[] = matches3.filter(m => m.orientation === 'vertical');
    const hmatches: MatchItem[] = matches3.filter(m => m.orientation === 'horizontal');
    for (const vmatch of vmatches) {
        if (vmatch.units.filter((u) => !u.status).length === 3) {
            for (const hmatch of hmatches) {
                const len = hmatch.units.filter((u) => !u.status).length;
                if (len === 3 && hmatch.start.row >= vmatch.start.row &&
                    hmatch.start.row <= vmatch.end.row &&
                    vmatch.start.column >= hmatch.start.column &&
                    vmatch.start.column <= hmatch.end.column) {
                    const verticalAtEndpoint = hmatch.start.row === vmatch.end.row && (hmatch.start.column === vmatch.end.column ||
                        hmatch.end.column === vmatch.end.column);

                    const verticalAtStartpoint = hmatch.start.row === vmatch.start.row && (hmatch.start.column === vmatch.start.column ||
                        hmatch.end.column === vmatch.start.column);
                    console.log(verticalAtEndpoint + ":" + verticalAtStartpoint)
                    const mtype = verticalAtEndpoint || verticalAtStartpoint ? CANDY_MATCH_TYPE.LMODEL : CANDY_MATCH_TYPE.TMODEL;

                    if (mtype) {
                        vmatch.status = 1;
                        hmatch.status = 1;
                        specials.push({ type: mtype, size: 5, items: [vmatch, hmatch] });
                        vmatch.units.forEach((u) => u.status = 1)
                        hmatch.units.forEach((u) => u.status = 1);
                    }
                }
            }
        }
    }
    return specials
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