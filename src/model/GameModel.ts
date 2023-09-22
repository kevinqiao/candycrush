import { CellItem } from "./CellItem";

export interface GameModel {
    gameId: string;
    lastCellId?: number;
    seed: string | undefined;
    rth?: number;
    cells: CellItem[];
}