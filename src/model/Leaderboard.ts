import { User } from "./User";

export interface Leaderboard {
    id: number;
    user: User;
    points: number;
    lastUpdate: number;
    tournamentId: string;
}