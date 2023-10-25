import seedrandom from 'seedrandom';
import { CellItem } from "../model/CellItem";
import { MATCH_DIRECTION, MOVE_DIRECTION } from "../model/Constants";
import { MatchModel } from '../model/MatchModel';
import candy_textures from "../model/candy_textures";
import * as Utils from "../util/Utils";

const COLUMN = 7;
const ROW = 8;


function getMatchType(verticalMatch: Match, horizontalMatch: Match): 'T' | 'L' | null {
    // Check if they intersect at a non-endpoint for the vertical match
    const verticalIntersectionAtEnd = horizontalMatch.start.row === verticalMatch.start.row || horizontalMatch.start.row === verticalMatch.end.row;

    // Check if they intersect at a non-endpoint for the horizontal match
    const horizontalIntersectionAtEnd = verticalMatch.start.column === horizontalMatch.start.column || verticalMatch.start.column === horizontalMatch.end.column;

    if (verticalIntersectionAtEnd && horizontalIntersectionAtEnd) {
        return null;  // This isn't a T or L match
    }

    if (verticalMatch.units.length > 3 || horizontalMatch.units.length > 3) {
        return 'T';
    }

    return 'L';
}



type Match = {
    units: CellItem[];
    start: { row: number; column: number };
    end: { row: number; column: number };
    orientation: 'horizontal' | 'vertical';
};

export const findMatches = (grid: CellItem[][]): Match[] => {
    const rows = grid.length;
    const columns = grid[0].length;
    const matches: Match[] = [];

    for (let row = 0; row < rows; row++) {
        let col = 0;
        while (col < columns) {
            const unit = grid[row][col];

            // Check horizontal matches
            if (col < columns - 2 && !unit.status &&
                unit.asset === grid[row][col + 1].asset &&
                unit.asset === grid[row][col + 2].asset) {
                const matchUnits: CellItem[] = [];
                let offset = 0;
                while (col + offset < columns && unit.asset === grid[row][col + offset].asset) {
                    matchUnits.push(grid[row][col + offset]);
                    offset++;
                }

                matches.push({
                    units: matchUnits,
                    start: { row: row, column: col },
                    end: { row: row, column: col + offset - 1 },
                    orientation: 'horizontal'
                });

                col += offset; // Move the column pointer by the size of the match
                continue; // Skip to the next iteration to avoid rechecking this column
            }

            col++; // Move to the next column if no match was found
        }
    }

    for (let col = 0; col < columns; col++) {
        let row = 0;
        while (row < rows) {
            const unit = grid[row][col];

            // Check vertical matches
            if (row < rows - 2 && !unit.status &&
                unit.asset === grid[row + 1][col].asset &&
                unit.asset === grid[row + 2][col].asset) {
                const matchUnits: CellItem[] = [];
                let offset = 0;
                while (row + offset < rows && unit.asset === grid[row + offset][col].asset) {
                    matchUnits.push(grid[row + offset][col]);
                    offset++;
                }

                matches.push({
                    units: matchUnits,
                    start: { row: row, column: col },
                    end: { row: row + offset - 1, column: col },
                    orientation: 'vertical'
                });

                row += offset; // Move the row pointer by the size of the match
                continue; // Skip to the next iteration to avoid rechecking this row
            }

            row++; // Move to the next row if no match was found
        }
    }

    return matches;
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

export const getSwipeTarget = (cellItem: CellItem, direction: number, cells: CellItem[]): CellItem | undefined => {

    let target;
    if (cellItem) {
        switch (direction) {
            //right move
            case MOVE_DIRECTION.RIGHT:
                target = cells.find((c) => c.row === cellItem.row && c.column === cellItem.column + 1);
                break;
            //down move
            case MOVE_DIRECTION.DOWN:
                target = cells.find((c) => c.row === cellItem.row + 1 && c.column === cellItem.column);
                break;
            //left move
            case MOVE_DIRECTION.LEFT:
                target = cells.find((c) => c.row === cellItem.row && c.column === cellItem.column - 1);
                break;
            //up move
            case MOVE_DIRECTION.UP:
                target = cells.find((c) => c.row === cellItem.row - 1 && c.column === cellItem.column);
                break;
            default:
                break;
        }
    }

    return target;

}
export const getMatches = (cells: CellItem[]): MatchModel[] | undefined => {

    const horMatches: MatchModel[] = [];
    const verMatches: MatchModel[] = []

    // Check for horizontal matches
    for (let y = 0; y < ROW; y++) {
        let start = cells.find((c) => c.row === y && c.column === 0);
        let count = 0;

        for (let x = 0; x < COLUMN - 1; x++) {
            const cur = cells.find((c) => c.row === y && c.column === x);
            const next = cells.find((c) => c.row === y && c.column === x + 1);
            if (cur && next) {
                if (!start)
                    start = cur;
                if (next.asset === cur.asset) {
                    count++;
                } else {
                    if (count >= 2) {
                        horMatches.push({ start: start, end: cur, size: count + 1, direction: MATCH_DIRECTION.HORIZATION, asset: cur.asset })
                    }
                    start = next;
                    count = 0;
                }
            }

        }
        if (start && count >= 2) {
            const cur = cells.find((c) => c.column === COLUMN - 1 && c.row === y);
            if (cur)
                horMatches.push({ start: start, end: cur, size: count + 1, direction: MATCH_DIRECTION.HORIZATION, asset: cur.asset })
        }

    }

    // Check for vertical matches
    for (let x = 0; x < COLUMN; x++) {
        let start: CellItem | null = null;
        let count = 0;

        for (let y = 0; y < ROW - 1; y++) {

            const cur = cells.find((c) => c.row === y && c.column === x);
            const next = cells.find((c) => c.row === y + 1 && c.column === x);

            if (cur && next) {
                if (!start)
                    start = cur;
                if (next.asset === cur.asset) {
                    count++;
                } else {
                    if (count >= 2) {
                        verMatches.push({ start: start, end: cur, size: count + 1, direction: MATCH_DIRECTION.VERTICAL, asset: cur.asset })
                    }
                    start = next;
                    count = 0;
                }
            }

        }
        if (start && count >= 2) {
            const cur = cells.find((c) => c.row === ROW - 1 && c.column === x);
            if (cur)
                verMatches.push({ start: start, end: cur, size: count + 1, direction: MATCH_DIRECTION.VERTICAL, asset: cur.asset })
        }
    }

    return [...horMatches, ...verMatches]

}


function handleMatch(grid: CellItem[][]) {

    const match4: Match[] = [];
    const matchSpecials: { type: string, matches: Match[] }[] = [];
    while (true) {
        const matches: Match[] = findMatches(grid);

        //check for more than 4 connect
        const mplus4 = matches.filter((m) => m.units.length >= 4);
        if (mplus4.length === 0)
            break;
        mplus4.sort((a, b) => {
            return a.units.length - b.units.length
        })
        for (let match of mplus4) {
            if (match4.length === 0) {
                match4.push(match);
                match.units.forEach((u) => u.status = 1)
            } else {
                const cs = match4.filter((m) => {
                    if (m.orientation === match.orientation)
                        return false
                    else {
                        const vmatch = m.orientation === "vertical" ? m : match;
                        const hmatch = m.orientation === "horizontal" ? m : match;
                        if (hmatch.start.row >= vmatch.start.row &&
                            hmatch.start.row <= vmatch.end.row &&
                            vmatch.start.column >= hmatch.start.column &&
                            vmatch.start.column <= hmatch.end.column)
                            return true;
                        return false;
                    }
                })
                if (cs.length === 0) {
                    match4.push(match);
                    match.units.forEach((u) => u.status = 1)
                }
            }
        }
    }
    // Check for T or L
    while (true) {
        let nospecial = true;
        const matches: Match[] = findMatches(grid);
        if (matches.length === 0)
            break;
        for (const verticalMatch of matches.filter(m => m.orientation === 'vertical')) {
            for (const horizontalMatch of matches.filter(m => m.orientation === 'horizontal')) {
                if (horizontalMatch.start.row >= verticalMatch.start.row &&
                    horizontalMatch.start.row <= verticalMatch.end.row &&
                    verticalMatch.start.column >= horizontalMatch.start.column &&
                    verticalMatch.start.column <= horizontalMatch.end.column) {
                    const matchType = getMatchType(verticalMatch, horizontalMatch);
                    if (matchType) {
                        matchSpecials.push({ type: matchType, matches: [horizontalMatch, verticalMatch] });
                        verticalMatch.units.forEach((u) => u.status = 1)
                        horizontalMatch.units.forEach((u) => u.status = 1)
                        nospecial = false
                    }
                }
            }
        }
        if (nospecial)
            break;
    }

    const match3: Match[] = findMatches(grid);

}

export const processSwapped = (game: any, freeCanides: CellItem[]) => {
    // { cells: CellItem[]; lastCellId: number; seed: string; matched: { asset: number; quantity: number }[] }

    const allResults: any[] = [];
    let count = 0;
    while (true) {
        count++;
        const matches: MatchModel[] | undefined = getMatches(game.cells);

        if (matches && matches.length > 0) {

            const rs = processMatches(game.cells, matches);

            if (rs?.toRemove) {
                const toCreate: CellItem[] = [];
                for (let i = 0; i < COLUMN; i++) {
                    const size = rs.toRemove.filter((c) => c.column === i).length;
                    for (let j = 0; j < size; j++) {
                        // const random = RandomUtil.getNthRandom(game.seed, game.lastCellId ?? 0);
                        // const index = Math.floor(random * (candy_textures.length - 10));
                        // const asset = candy_textures[index]["id"] ?? 0;
                        const candy = freeCanides.find((f) => f.id === game.lastCellId);
                        if (candy) {
                            candy.column = i;
                            candy.row = j;
                            toCreate.push(candy);
                            game.lastCellId++;
                        }

                        // const cell = {
                        //     asset,
                        //     column: i,
                        //     id: game.lastCellId ? game.lastCellId++ : 0,
                        //     row: j,
                        // };
                        // toCreate.push(cell);
                    }
                }
                rs['toCreate'] = toCreate;
            }
            // console.log(rs)
            const res = applyMatches({ cells: game.cells, matched: game.matched ?? [] }, rs);
            game.cells = res.cells;
            game.matched = res.matched;

            allResults.push({ id: count, ...rs, score: res.score });

        } else {
            break;
        }
    }
    return allResults
}
export const initGame = () => {
    const seed = Utils.getRandomSeed(10);
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

export const processMatches = (cells: CellItem[], matches: MatchModel[]) => {
    let results: { toRemove?: CellItem[], toMove?: CellItem[], toCreate?: CellItem[] } = {};
    const allRemoves: CellItem[] = [];
    const ucells = JSON.parse(JSON.stringify(cells));
    for (let match of matches) {

        let removes: CellItem[] = ucells.filter(
            (c: CellItem) =>
                c.row >= match.start.row &&
                c.row <= match.end.row &&
                c.column >= match.start.column &&
                c.column <= match.end.column && !allRemoves.some((a) => a.id === c.id)
        )
        allRemoves.push(...removes)
    }

    for (let r of allRemoves) {
        r.status = 1;
        let moves: CellItem[] = ucells.filter((c: CellItem) => c.status !== 1 && c.column === r.column && c.row < r.row);
        moves.forEach((m: CellItem) => {
            m.row = m.row + 1;
            m.status = 2
        })

    }

    results.toRemove = allRemoves;
    results.toMove = ucells.filter((u: CellItem) => u.status === 2).sort((a: CellItem, b: CellItem) => {
        return a.column - b.column
    });
    return results;

}

export const applyMatches = (
    game: { matched: { asset: number; quantity: number }[]; cells: CellItem[] },
    results: { id?: number; toMove?: CellItem[]; toRemove?: CellItem[]; toCreate?: CellItem[] }
) => {

    let resovledCells: CellItem[] = JSON.parse(JSON.stringify(game.cells));
    let rematched: { asset: number; quantity: number }[] = JSON.parse(JSON.stringify(game.matched));
    // console.log(JSON.parse(JSON.stringify(cells)))
    if (results.toRemove) {
        const rids: number[] = results.toRemove.map((c) => c.id);
        resovledCells = resovledCells.filter((c) => !rids.includes(c.id));
        for (let r of results.toRemove) {
            const mitem = rematched.find((m: { asset: number; quantity: number }) => m.asset === r.asset);
            if (mitem) mitem.quantity++;
            else rematched.push({ asset: r.asset, quantity: 1 });
        }

    }
    // console.log(JSON.parse(JSON.stringify(resovledCells)))
    if (results.toMove) {
        for (let m of results.toMove) {
            const move = resovledCells.find((c) => c.id === m.id);
            if (move) Object.assign(move, m);
        }
    }
    if (results.toCreate) {
        resovledCells.push(...results.toCreate);
    }
    const score = rematched.reduce((total, a) => total + a.quantity, 0)
    // console.log(JSON.parse(JSON.stringify(resovledCells)))
    return {
        cells: resovledCells, matched: rematched, score
    };
}


