export type GameResult = {
    base: number;
    time: number;
    goal: number;
    total?: number;
}
export interface GameModel {
    gameId: string;
    battleId: string;
    uid: string;
    tid: string;
    result?: GameResult;
    score?: number;
    lastStep: number;
    // cells: CellItem[];
    // lastCellId?: number;
    // matched?: { asset: number, quantity: number }[];
    // goal: number;
    startTime: number;
    status: number;
    type: number;
    data: any;
}