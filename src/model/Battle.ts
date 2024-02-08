
export interface BattleModel {
    id: string;
    type: number;//0-solo 1-pvp
    games?: { uid: string; avatar?: number; status?: number; gameId: string; score?: { base: number; time: number; goal: number; total: number }, matched: { asset: number; quantity: number }[] }[];
    column: number;
    row: number;
    tournamentId: string;
    load?: number;//0-init 1-reload
    status?: number;//0-active 1-over 2-settled
    goal: number;
    rewards?: BattleReward[];
    searchDueTime?: number;
    startTime?: number;
}

export type BattleReward = {
    uid: string;
    gameId: string;
    rank: number;
    score: number;
    points?: number;
    assets?: { asset: number, amount: number }[]
}