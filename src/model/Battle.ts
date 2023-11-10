export default interface BattleModel {
    id: string;
    type: number;//0-solo 1-sync 2-turn 
    games: { uid: string, gameId: string }[];
    tournamentId: string;
    status?: number;//0-active 1-over 2-settled
}