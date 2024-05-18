export interface Tournament {
    id: string;
    creator?: string;//uid
    context?: string;
    type?: number;//0- group  1-pvp by rank score 2-single for scoring rank by  best score
    participants: number;
    battle: { type: number; duration: number; sessions: number; players: number };//type:0-sync 1-async 2-sync or async
    openTime?: number;
    closeTime?: number;
    schedule?: { day: number; weekday: number; hour: number; minute: number };
    entry?: { level: number; cost: { asset: number; amount: number }[] };
    rewards: { rank: number; assets: { asset: number; amount: number }[] }[],
    status?: number;//0-close 1-open
}