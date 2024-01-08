
export interface TournamentDef {
    id: number;
    participants: number;
    type: number;//0-one battle 1-unlimit battle
    battleTime: number;
    goals?: { asset: number; quantity: number }[];
    entryCost: { assetId: number; amount: number }[];
    rewards: { rank: number; assetId: number; amount: number }[];
}
export const tournamentDefs: TournamentDef[] = [
    {
        id: 1,
        participants: 2,
        type: 0,
        battleTime: 300000,
        goals: [{ asset: 1, quantity: 10 }, { asset: 2, quantity: 12 }],
        entryCost: [{ assetId: 1, amount: 100 }, { assetId: 2, amount: 100 }],
        rewards: [{ rank: 1, assetId: 3, amount: 100 }, { rank: 2, assetId: 3, amount: 100 }]
    },
    {
        id: 2,
        participants: 2,
        battleTime: 300000,
        type: 1,
        goals: [{ asset: 1, quantity: 10 }, { asset: 2, quantity: 12 }],
        entryCost: [{ assetId: 1, amount: 100 }, { assetId: 2, amount: 100 }],
        rewards: [{ rank: 1, assetId: 3, amount: 500 }, { rank: 2, assetId: 3, amount: 100 }],
    }
]
