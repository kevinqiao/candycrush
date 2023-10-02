import { CellItem } from "../model/CellItem";
import { MATCH_DIRECTION, MOVE_DIRECTION } from "../model/Constants";
import { MatchModel } from "../model/MatchModel";
import candy_textures from "../model/candy_textures";
const COLUMN = 7;
const ROW = 8;
let cellId: number = COLUMN * ROW + 1;

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
export const initGame = () => {
    // const cellTypes = Array.from({ length: 6 }, (_, k) => k);
    const cells: CellItem[] = [];
    let cellId: number = 1;
    for (let y = 0; y < ROW; y++) {
        for (let x = 0; x < COLUMN; x++) {
            let asset = -1;
            while (true) {
                const index = Math.floor(Math.random() * (candy_textures.length - 10));
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

            cells.push({ id: cellId++, row: y, column: x, asset });
        }
    }
    return cells;
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
    cells: CellItem[],
    results: { toMove?: CellItem[]; toRemove?: CellItem[]; toCreate?: CellItem[] }
) => {
    let resovledCells: CellItem[] = JSON.parse(JSON.stringify(cells));
    // console.log(JSON.parse(JSON.stringify(cells)))
    if (results.toRemove) {
        const rids: number[] = results.toRemove.map((c) => c.id);
        resovledCells = resovledCells.filter((c) => !rids.includes(c.id));
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
    // console.log(JSON.parse(JSON.stringify(resovledCells)))
    return resovledCells;
};



