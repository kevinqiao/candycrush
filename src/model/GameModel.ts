import { CellItem } from "./CellItem";
export type GameResult = {
    base:number;
    time:number;
    goal:number;
}
export interface GameModel {
    gameId: string;
    battleId: string;
    tournamentId: string;
    lastCellId?: number;
    rth?: number;
    result?:GameResult;
    score?:number;
    cells: CellItem[];
    matched?:{asset:number,quantity:number}[];
}