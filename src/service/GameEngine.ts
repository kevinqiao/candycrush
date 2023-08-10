import { CellItem } from "../model/CellItem";
let cellId: number = 50;
export const checkMatchAt = (cells: CellItem[], cellAt: CellItem): boolean => {


    if (cellAt) {
        // Check horizontal match
        let horizontalMatchLength = 1;
        for (let i = cellAt.column + 1; i < 7; i++) {
            const cell = cells.find((c) => c.row === cellAt.row && c.column === i);
            if (cell?.asset === cellAt.asset)
                horizontalMatchLength++;
            else
                break;
        }
        for (let i = cellAt.column - 1; i >= 0; i--) {
            const cell = cells.find((c) => c.row === cellAt.row && c.column === i);
            if (cell?.asset === cellAt.asset)
                horizontalMatchLength++;
            else
                break;

        }
        // Check vertical match
        let verticalMatchLength = 1;
        for (let i = cellAt.row + 1; i < 7; i++) {
            const cell = cells.find((c) => c.row === i && c.column === cellAt.column);
            if (cell?.asset === cellAt.asset)
                verticalMatchLength++;
            else
                break;
        }
        for (let i = cellAt.row - 1; i >= 0; i--) {
            const cell = cells.find((c) => c.row === i && c.column === cellAt.column);
            if (cell?.asset === cellAt.asset)
                verticalMatchLength++;
            else
                break;
        }
        console.log(cellAt)
        console.log(horizontalMatchLength + ":" + verticalMatchLength)
        return horizontalMatchLength >= 3 || verticalMatchLength >= 3;
    }
    return false;

}
export const checkForMatches = (cells: CellItem[]) => {
    const matches = [];

    // Check for horizontal matches
    for (let y = 0; y < 7; y++) {
        let matchStart: CellItem | null | undefined = null;
        let matchEnd: CellItem | null | undefined = null;

        for (let x = 0; x < 7; x++) {
            if (matchStart === null || matchStart === undefined) {
                matchStart = cells.find((c) => c.row === y && c.column === x);
            } else {
                const current = cells.find((c) => c.row === y && c.column === x);
                if (current?.asset !== matchStart?.asset) {
                    if (matchStart && matchEnd && matchEnd?.column - matchStart?.column >= 2) {
                        matches.push({ start: matchStart, end: matchEnd, direction: 1, size: matchEnd.column - matchStart.column + 1 });
                        console.log(JSON.stringify(matchStart))
                    }
                    matchStart = current
                } else
                    matchEnd = current;
            }

        }
    }
    console.log(JSON.stringify(matches))
    // Check for vertical matches
    for (let x = 0; x < 7; x++) {
        let matchStart: CellItem | null | undefined = null;
        let matchEnd: CellItem | null | undefined = null;
        for (let y = 0; y < 7; y++) {
            if (matchStart === null || matchStart === undefined) {
                matchStart = cells.find((c) => c.row === y && c.column === x);
            } else {
                const current = cells.find((c) => c.row === y && c.column === x);
                if (current?.asset !== matchStart?.asset) {
                    if (matchStart && matchEnd && matchEnd?.row - matchStart?.row >= 2)
                        matches.push({ start: matchStart, end: matchEnd, direction: 2, size: matchEnd.row - matchStart.row + 1 });
                    matchStart = current
                } else
                    matchEnd = current;
            }

        }
    }
    console.log(JSON.stringify(matches))
    return matches;

}
export const initGame = () => {
    const cellTypes = Array.from({ length: 7 }, (_, k) => k);
    const cells: CellItem[] = [];
    let cellId: number = 1;
    for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
            let asset = -1;
            const ts = [...cellTypes];
            while (ts.length > 0) {
                const index = Math.floor(Math.random() * (ts.length - 1));
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
    console.log(matches)
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
        const asset = Math.floor(Math.random() * 7);
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

