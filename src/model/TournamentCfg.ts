import { BATTLE_TYPE } from "./Constants";

export const tournamentDefs = [
    {
        id: 1,
        type: 1,
        participants: 5,
        battleType: BATTLE_TYPE.SOLO,
        battleTime: 300000,
        entryCost: [{ assetId: 1, amount: 100 }, { assetId: 2, amount: 100 }],
        rewards: [{ rank: 1, assetId: 3, amount: 100 }, { rank: 2, assetId: 3, amount: 100 }]
    },
    {
        id: 2,
        type: 2,
        participants: 2,
        battleTime: 300000,
        battleType: BATTLE_TYPE.SYNC,
        entryCost: [{ assetId: 1, amount: 100 }, { assetId: 2, amount: 100 }],
        rewards: [{ rank: 1, assetId: 3, amount: 500 }, { rank: 2, assetId: 3, amount: 100 }],
    }
]
