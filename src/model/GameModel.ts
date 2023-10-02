import { CellItem } from "./CellItem";

export interface GameModel {
    gameId: string;
    lastCellId?: number;
    rth?: number;
    cells: CellItem[];
}