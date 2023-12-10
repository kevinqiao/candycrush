export default interface BattleModel {
    id: string;
    type: number;//0-solo 1-sync 2-turn 3-replay
    games: { uid: string; avatar?: number; gameId: string; matched: { asset: number; quantity: number }[] }[];
    column: number;
    row: number;
    tournamentId: string;
    load?: number;//0-init 1-reload
    status?: number;//0-active 1-over 2-settled
    goal: number;
}