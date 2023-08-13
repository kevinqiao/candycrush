import { CellItem } from "../model/CellItem";

const COLUMN = 7;
const ROW = 8;
let cellId: number = COLUMN * ROW + 1;
interface MatchModel {
    start: CellItem;
    end: CellItem;
    direction: number;
    size: number;
}

export const checkForMatches = (cells: CellItem[]) => {

    // Check for horizontal matches
    for (let y = 0; y < ROW; y++) {
        let matchStart = cells.find((c) => c.row === y && c.column === 0);
        let matchEnd = matchStart;

        for (let x = 1; x < COLUMN; x++) {
            const current = cells.find((c) => c.row === y && c.column === x);
            if (current && matchEnd && matchStart) {
                if ((current?.asset !== matchStart?.asset && current.column - matchStart.column > 2) || (current?.asset === matchStart?.asset && x === COLUMN - 1 && current.column - matchStart.column >= 2))
                    return true;
            }
            if (current?.asset !== matchStart?.asset) {
                matchStart = current
            } else
                matchEnd = current;
        }

    }

    // Check for vertical matches
    for (let x = 0; x < COLUMN; x++) {
        let matchStart = cells.find((c) => c.row === 0 && c.column === x);
        let matchEnd = matchStart;

        for (let y = 1; y < ROW; y++) {
            const current = cells.find((c) => c.row === y && c.column === x);

            if (current && matchEnd && matchStart) {
                if ((current?.asset !== matchStart?.asset && current.row - matchStart.row > 2) || (current?.asset === matchStart?.asset && y === ROW - 1 && current.row - matchStart.row >= 2))
                    return true;
            }
            if (current?.asset !== matchStart?.asset) {
                matchStart = current
            } else
                matchEnd = current;
        }

    }

    return false

}
export const getMatches = (cells: CellItem[]) => {

    const horMatches: MatchModel[] = [];
    const verMatches: MatchModel[] = []

    // Check for horizontal matches
    for (let y = 0; y < ROW; y++) {
        let matchStart = cells.find((c) => c.row === y && c.column === 0);
        let matchEnd = matchStart;
        // console.log(matchStart)
        let line = matchStart?.asset + " ";
        for (let x = 1; x < COLUMN; x++) {
            const current = cells.find((c) => c.row === y && c.column === x);
            line = line + current?.asset + " ";
            // if (current && matchStart)
            //     console.log(y + ":" + (current.column - matchStart.column))
            if (current && matchEnd && matchStart) {

                if (current?.asset !== matchStart?.asset && current.column - matchStart.column > 2)
                    horMatches.push({ start: matchStart, end: matchEnd, direction: 1, size: current.column - matchStart.column });
                else if (current?.asset === matchStart?.asset && x === COLUMN - 1 && current.column - matchStart.column >= 2)
                    horMatches.push({ start: matchStart, end: current, direction: 1, size: current.column - matchStart.column + 1 });
            }
            if (current?.asset !== matchStart?.asset) {
                matchStart = current
            } else
                matchEnd = current;

        }
        // console.log(line)
    }

    // Check for vertical matches
    for (let x = 0; x < COLUMN; x++) {
        let matchStart = cells.find((c) => c.row === 0 && c.column === x);
        let matchEnd = matchStart;
        // console.log(matchStart)
        let line = matchStart?.asset + " ";
        for (let y = 1; y < ROW; y++) {
            const current = cells.find((c) => c.row === y && c.column === x);
            line = line + current?.asset + " ";
            // if (current && matchStart)
            //     console.log(x + ":" + (current.row - matchStart.row))
            if (current && matchEnd && matchStart) {
                if (current?.asset !== matchStart?.asset && current.row - matchStart.row > 2)
                    verMatches.push({ start: matchStart, end: matchEnd, direction: 2, size: current.row - matchStart.row });
                else if (current?.asset === matchStart?.asset && y === ROW - 1 && current.row - matchStart.row >= 2)
                    verMatches.push({ start: matchStart, end: current, direction: 2, size: current.row - matchStart.row + 1 })
            }
            if (current?.asset !== matchStart?.asset) {
                matchStart = current
            } else
                matchEnd = current;
        }
        // console.log("vertical;" + line)
    }

    return [...horMatches, ...verMatches]

}
export const initGame = () => {
    const cellTypes = Array.from({ length: 6 }, (_, k) => k);
    console.log(cellTypes)
    const cells: CellItem[] = [];
    let cellId: number = 1;
    for (let y = 0; y < ROW; y++) {
        for (let x = 0; x < COLUMN; x++) {
            let asset = -1;
            const ts = [...cellTypes];
            while (ts.length > 0) {
                const index = Math.floor(Math.random() * ts.length);
                asset = ts[index];
                if (x >= 2) {
                    const x0 = cells.find((c) => c.row === y && c.column === x - 1);
                    const x1 = cells.find((c) => c.row === y && c.column === x - 2);
                    if (x0?.asset === asset && x1?.asset === asset) {
                        ts.splice(index, 1);
                        continue;
                    }
                }
                if (y >= 2) {
                    const y0 = cells.find((c) => c.row === y - 1 && c.column === x);
                    const y1 = cells.find((c) => c.row === y - 2 && c.column === x);
                    if (y0?.asset === asset && y1?.asset === asset) {
                        ts.splice(index, 1);
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
export const processMatch = (cells: CellItem[], matches: { start: CellItem; end: CellItem; direction: number; size: number }) => {

    const toRemoves: CellItem[] = cells.filter(
        (c: CellItem) =>
            c.row >= matches.start.row &&
            c.row <= matches.end.row &&
            c.column >= matches.start.column &&
            c.column <= matches.end.column
    );
    const toMoves: CellItem[] = cells
        .filter((c: CellItem) => {
            if (
                (matches.direction === 1 && c.row < matches.start.row && c.column >= matches.start.column && c.column <= matches.end.column) ||
                (matches.direction === 2 && c.column === matches.start.column && c.row < matches.start.row)
            )
                return true;
        })
        .map((m: CellItem, index: number) => {
            if (matches.direction === 1) return Object.assign({}, m, { row: m.row + 1 });
            else return Object.assign({}, m, { row: m.row + matches.size });
        });

    const toCreates: CellItem[] = [];
    for (let i = 0; i < matches.size; i++) {
        const asset = Math.floor(Math.random() * 6);
        const cell: CellItem = {
            id: cellId++,
            row: matches.direction === 1 ? 0 : i,
            column: matches.direction === 2 ? matches.start.column : i + matches.start.column,
            asset,
        };
        toCreates.push(cell);
    }

    return { toCreates, toRemoves, toMoves };

}


