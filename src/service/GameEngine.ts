import seedrandom from 'seedrandom';
import { CellItem } from "../model/CellItem";
import { CANDY_MATCH_TYPE } from '../model/Constants';
import candy_textures from "../model/candy_textures";
import * as Utils from "../util/Utils";

const COLUMN = 7;
const ROW = 8;
export type Match = {
    type: number;//0-LINE  1-T 2-L 
    size: number;
    status?: number;
    items: MatchItem[]
};
export type MatchItem = {
    units: CellItem[];
    start: { row: number; column: number };
    end: { row: number; column: number };
    orientation: 'horizontal' | 'vertical';
    status?: number;//0-active 1-inactive
};

export const getSwipeResult = (candyId: number, targetId: number, cells: CellItem[]): { toChange: CellItem[], toRemove: CellItem[] } => {
    const results: { toChange: CellItem[], toRemove: CellItem[] } = { toChange: [], toRemove: [] }
    const candy = cells.find((c: CellItem) => c.id === candyId);
    const target = cells.find((c: CellItem) => c.id === targetId);
    if (!candy || !target) return results;
    [candy.row, target.row] = [target.row, candy.row];
    [candy.column, target.column] = [target.column, candy.column];
    const matches: Match[] = checkMatches(cells)
    matches.filter((match) => match.size > 3).forEach((m) => {
        m.items[0].units.sort((a, b) => (a.row + a.column) - (b.row + b.column));
        const start = m.items[0].units[0];
        const end = m.items[0].units[m.items[0].units.length - 1];
        results.toRemove.push(Object.assign({}, start, { id: -1 }))
        if (m.items[0].orientation === "horizontal") {
            [start.column, end.column] = [end.column, start.column]
            end.asset = 28;
        } else {
            [start.row, end.row] = [end.row, start.row]
            end.asset = 29;
        }
        end.status = 0;
        results.toChange.push(JSON.parse(JSON.stringify(end)))
    })
    results.toRemove.push(...cells.filter((c: CellItem) => c.status && c.status > 0))
    return results
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

export const checkMatches = (cells: CellItem[]): Match[] => {
    cells.sort((a, b) => a.row !== b.row ? a.row - b.row : a.column - b.column)
    console.log(JSON.parse(JSON.stringify(cells)))
    // const result: { id: number; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[] = [];
    const grid: CellItem[][] = Array.from({ length: ROW }, () => Array(COLUMN).fill(null));
    for (const unit of cells) {
        // console.log(unit.row + ":" + unit.column + ":" + unit.asset)
        grid[unit.row][unit.column] = unit;
    }

    const allmatches: MatchItem[] = findMatches(grid);
    const matches4: Match[] = getMatchPlus4(allmatches);
    const specials: Match[] = getSpecials(allmatches);

    const matches3: MatchItem[] = allmatches.filter((m) => !m.status)
    const matches: Match[] = [];
    for (let m of matches3) {
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
    while (true) {
        const m4 = matches.filter((m) => !m.status && m.units.length >= 4).sort((a, b) => {
            return b.units.length - a.units.length
        })
        if (m4.length === 0)
            break;
        for (let m of m4) {
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
export const checkSwipe = (candyId: number, targetId: number, cells: CellItem[]): boolean => {
    let matched = false;
    const candies: CellItem[] = JSON.parse(JSON.stringify(cells));
    const candy: CellItem | undefined = candies.find((c) => c.id === candyId);
    const target: CellItem | undefined = candies.find((c) => c.id === targetId);
    if (candy && target && candies) {
        [candy.row, target.row] = [target.row, candy.row];
        [candy.column, target.column] = [target.column, candy.column];

        // Check for horizontal matches
        for (let y = 0; y < ROW; y++) {
            let matchStart = candies.find((c) => c.row === y && c.column === 0)

            for (let x = 1; x < COLUMN; x++) {
                const current = candies.find((c) => c.row === y && c.column === x);
                if (current?.asset !== matchStart?.asset) {
                    matchStart = current
                }
                if (current && matchStart && current.column - matchStart.column >= 2) {
                    matched = true;
                    break;
                }
            }

        }
        // Check for vertical matches
        for (let x = 0; x < COLUMN; x++) {
            let matchStart = candies.find((c) => c.row === 0 && c.column === x);
            for (let y = 1; y < ROW; y++) {
                const current = candies.find((c) => c.row === y && c.column === x);
                if (current?.asset !== matchStart?.asset) {
                    matchStart = current
                }

                if (current && matchStart && (current?.row - matchStart?.row >= 2)) {
                    matched = true;
                    break;
                }
            }
        }
    }
    return matched;
}


export const createGame = (seed: string) => {
    const rng = seedrandom(seed)
    // const cellTypes = Array.from({ length: 6 }, (_, k) => k);
    const cells: CellItem[] = [];
    let lastCellId: number = 1;
    for (let y = 0; y < ROW; y++) {
        for (let x = 0; x < COLUMN; x++) {
            let asset = -1;
            while (true) {
                const index = Math.floor(rng() * (candy_textures.length - 10));
                asset = candy_textures[index]['id'] ?? 0;
                if (x >= 2) {
                    const x0 = cells.find((c) => c.row === y && c.column === x - 1);
                    const x1 = cells.find((c) => c.row === y && c.column === x - 2);
                    if (x0?.asset === asset && x1?.asset === asset) {
                        continue;
                    }
                }
                if (y >= 2) {
                    const y0 = cells.find((c) => c.row === y - 1 && c.column === x);
                    const y1 = cells.find((c) => c.row === y - 2 && c.column === x);
                    if (y0?.asset === asset && y1?.asset === asset) {
                        continue;
                    }
                }
                break;
            }

            cells.push({ id: lastCellId++, row: y, column: x, asset });
        }
    }
    return { lastCellId, cells, seed };
}

export const initGame = () => {
    const seed = Utils.getRandomSeed(10);
    return createGame(seed)
    // const rng = seedrandom(seed)
    // // const cellTypes = Array.from({ length: 6 }, (_, k) => k);
    // const cells: CellItem[] = [];
    // let lastCellId: number = 1;
    // for (let y = 0; y < ROW; y++) {
    //     for (let x = 0; x < COLUMN; x++) {
    //         let asset = -1;
    //         while (true) {
    //             const index = Math.floor(rng() * (candy_textures.length - 10));
    //             asset = candy_textures[index]['id'] ?? 0;
    //             if (x >= 2) {
    //                 const x0 = cells.find((c) => c.row === y && c.column === x - 1);
    //                 const x1 = cells.find((c) => c.row === y && c.column === x - 2);
    //                 if (x0?.asset === asset && x1?.asset === asset) {
    //                     continue;
    //                 }
    //             }
    //             if (y >= 2) {
    //                 const y0 = cells.find((c) => c.row === y - 1 && c.column === x);
    //                 const y1 = cells.find((c) => c.row === y - 2 && c.column === x);
    //                 if (y0?.asset === asset && y1?.asset === asset) {
    //                     continue;
    //                 }
    //             }
    //             break;
    //         }

    //         cells.push({ id: lastCellId++, row: y, column: x, asset });
    //     }
    // }
    // return { lastCellId, cells, seed };
}


export const applyMatches = (
    gameObj: { matched: { asset: number; quantity: number }[]; cells: CellItem[] },
    results: { id?: number; toMove?: CellItem[]; toChange?: CellItem[]; toRemove?: CellItem[]; toCreate?: CellItem[] }
) => {
    const game: { matched: { asset: number; quantity: number }[]; cells: CellItem[] } = JSON.parse(JSON.stringify(gameObj))
    const { toRemove, toMove, toChange, toCreate } = results;
    if (toRemove) {
        game.cells = game.cells.filter((c) => toRemove.findIndex((r) => r.id === c.id) < 0)
    }
    if (toChange) {
        toChange.forEach((c) => {
            const cell = game.cells.find((s) => s.id === c.id);
            if (cell)
                Object.assign(cell, c);
            console.log(cell)
        })
    }
    if (toMove) {
        toMove.forEach((c) => {
            const cell = game.cells.find((s) => s.id === c.id);
            if (cell)
                Object.assign(cell, c);
        })
    }
    if (toCreate) {
        game.cells = [...game.cells, ...toCreate]
    }
    return game
}
export const getScore = (game: any) => {
    const score: { base: number; goal: number; time: number } = { base: 0, goal: 0, time: 0 };
    if (game.score)
        Object.assign(score, game.score);
    else if (game.matched) {
        score.base = game.matched.reduce((s: number, a: { asset: number; quantity: number }) => s + a.quantity, 0);
    }
    return score;
}



