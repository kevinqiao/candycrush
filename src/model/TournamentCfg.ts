export const tournamentDefs = [
    {
        id: 1,
        type: 1,
        participants: 5,
        battleType: 1,
        entryCost: [{ assetId: 1, amount: 100 }, { assetId: 2, amount: 100 }],
        rewards: [{ rank: 1, assetId: 3, amount: 100 }, { rank: 2, assetId: 3, amount: 100 }]
    },
    {
        id: 2,
        type: 2,
        participants: 2,
        battleType: 2,
        entryCost: [{ assetId: 1, amount: 100 }, { assetId: 2, amount: 100 }],
        rewards: [{ rank: 1, assetId: 3, amount: 500 }, { rank: 2, assetId: 3, amount: 100 }],
    }
]
