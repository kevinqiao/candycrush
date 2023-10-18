import { CellItem } from "./CellItem";

export interface GameModel {
    gameId: string;
    battleId: string;
    tournamentId: string;
    lastCellId?: number;
    rth?: number;
    cells: CellItem[];
}