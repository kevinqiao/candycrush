
export interface BattleModel {
    id: string;
    type?: number;//0-solo 1-pvp
    duration: number;
    games?: { uid: string; avatar?: number; gameId: string; score?: { base: number; time: number; goal: number; total?: number }, data?: any }[];
    // column: number;
    // row: number;
    // goal: number;
    tournamentId: string;
    status?: number;//0-active 1-over 2-settled
    rewards?: BattleReward[];
    searchDueTime?: number;
    startTime?: number;
    data: any;
}

export type BattleReward = {
    uid: string;
    gameId: string;
    rank: number;
    score: number;
    points?: number;
    assets?: { asset: number, amount: number }[]
}