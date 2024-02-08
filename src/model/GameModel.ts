import { CellItem } from "./CellItem";
export type GameResult = {
    base: number;
    time: number;
    goal: number;
}
export interface GameModel {
    gameId: string;
    battleId: string;
    uid: string;
    tid: string;
    lastCellId?: number;
    result?: GameResult;
    score?: number;
    cells: CellItem[];
    matched?: { asset: number, quantity: number }[];
    startTime: number;
    status: number;
    type: number;
    goal: number;
}