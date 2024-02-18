export interface Tournament {
    id: string;
    gameType: number;
    participants: number;
    battleTime: number;
    currentTerm?: number;
    schedule?: { startDay: number; duration: number };
    goal?: number,
    cost?: { asset: number; quantity: number }[],
    rewards: { rank: number; assets: { asset: number; amount: number }[]; points: number }[],
}