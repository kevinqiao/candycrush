import seedrandom from 'seedrandom';
import goals from "../component/play/goals";
import { BattleModel, BattleReward } from '../model/Battle';
import { CellItem } from "../model/CellItem";
import { BATTLE_DURATION, GAME_ACTION, GAME_EVENT } from '../model/Constants';
import { GameModel } from '../model/GameModel';
import { Tournament } from '../model/Tournament';
import candy_textures from "../model/candy_textures";
import { checkMatches, getFreeCandy } from '../util/MatchGameUtils';
interface SwipeResult {
    candy: CellItem;
    target: CellItem;
    results: { toChange: CellItem[]; toCreate?: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[];
}

export type Match = {
    type: number;//0-LINE  1-T 2-L 
    size: number;
    status?: number;
    items: MatchItem[]
};
export type MatchItem = {
    units: CellItem[];
    start: { row: number; column: number };
    end: { row: number; column: number };
    orientation: 'horizontal' | 'vertical';
    status?: number;//0-active 1-inactive
};

// export const getSwipeResult = (candyId: number, targetId: number, cells: CellItem[], row: number, column: number): { toChange: CellItem[], toRemove: CellItem[] } => {
//     const results: { toChange: CellItem[], toRemove: CellItem[] } = { toChange: [], toRemove: [] }
//     const candy = cells.find((c: CellItem) => c.id === candyId);
//     const target = cells.find((c: CellItem) => c.id === targetId);
//     if (!candy || !target) return results;
//     [candy.row, target.row] = [target.row, candy.row];
//     [candy.column, target.column] = [target.column, candy.column];
//     cells.sort((a, b) => a.row !== b.row ? a.row - b.row : a.column - b.column)
//     const grid: CellItem[][] = Array.from({ length: row }, () => Array(column).fill(null));
//     for (const unit of cells) {
//         // console.log(unit.row + ":" + unit.column + ":" + unit.asset)
//         grid[unit.row][unit.column] = unit;
//     }
//     const matches: Match[] = checkMatches(grid)
//     matches.filter((match) => match.size > 3).forEach((m) => {
//         m.items[0].units.sort((a, b) => (a.row + a.column) - (b.row + b.column));
//         const start = m.items[0].units[0];
//         const end = m.items[0].units[m.items[0].units.length - 1];
//         results.toRemove.push(Object.assign({}, start, { id: -1 }))
//         if (m.items[0].orientation === "horizontal") {
//             [start.column, end.column] = [end.column, start.column]
//             end.asset = 28;
//         } else {
//             [start.row, end.row] = [end.row, start.row]
//             end.asset = 29;
//         }
//         end.status = 0;
//         results.toChange.push(JSON.parse(JSON.stringify(end)))
//     })
//     results.toRemove.push(...cells.filter((c: CellItem) => c.status && c.status > 0))
//     return results
// }

export const initGame = (defender: any, seed: string) => {
    const { row, column } = defender.data as { row: number; column: number };
    const rng = seedrandom(seed)
    // const cellTypes = Array.from({ length: 6 }, (_, k) => k);
    const cells: CellItem[] = [];
    let lastCellId = 1;
    for (let y = 0; y < row; y++) {
        for (let x = 0; x < column; x++) {
            let asset = -1;
            let loop = true;
            while (loop) {
                const index = Math.floor(rng() * 10);
                asset = candy_textures[index]['id'] ?? 0;
                if (x >= 2) {
                    const x0 = cells.find((c) => c.row === y && c.column === x - 1);
                    const x1 = cells.find((c) => c.row === y && c.column === x - 2);
                    if (x0?.asset === asset && x1?.asset === asset) {
                        continue;
                    }
                }
                if (y >= 2) {
                    const y0 = cells.find((c) => c.row === y - 1 && c.column === x);
                    const y1 = cells.find((c) => c.row === y - 2 && c.column === x);
                    if (y0?.asset === asset && y1?.asset === asset) {
                        continue;
                    }
                }
                loop = false
                break;
            }

            cells.push({ id: lastCellId++, row: y, column: x, asset });
        }
    }
    return { lastCellId, cells };
}




export const settleGame = (game: any): { base: number; time: number; goal: number } | null | undefined => {
    let result;
    let goalScore = 0;
    const goalId = game.defender.goal;
    const goalModel = goals.find((g: { id: number, goal: { asset: number, quantity: number }[] }) => g.id === goalId);
    if (goalModel && game.data.matched) {
        const goalSuccess = goalModel.goal.map((g) => {
            const m = game.data.matched.find((m: { asset: number; quantity: number }) => m.asset === g.asset);
            const quantity = m ? g.quantity - m.quantity : g.quantity;
            return { asset: g.asset, quantity };
        }).every((r) => r.quantity <= 0);
        if (goalSuccess) {
            goalScore = 1000;
        }

        const playTime = Date.now() - game.startTime;
        if ((playTime - BATTLE_DURATION) >= 0 || goalScore > 0) {
            const baseScore = game.data.matched.reduce((s: number, a: { asset: number; quantity: number }) => s + a.quantity, 0);
            const timeScore = (BATTLE_DURATION - playTime) * 10;
            result = { base: baseScore, time: timeScore ?? 0, goal: goalScore ?? 0 }
        }
    }
    return result
}

export const handleEvent = (name: string, eventData: any, game: any) => {

    if (name === GAME_EVENT.SWIPE_CANDY) {
        const candy: CellItem | undefined = game.data.cells.find((c: CellItem) => c.id === eventData.candy.id);
        const target: CellItem | undefined = game.data.cells.find((c: CellItem) => c.id === eventData.target.id);
        if (candy && target) {
            [candy.row, target.row] = [target.row, candy.row];
            [candy.column, target.column] = [target.column, candy.column];
        }
    }
    console.log(eventData)
    applyEventResult(eventData.results, game)
}
const applyEventResult = (
    results: { toCreate: CellItem[]; toChange: CellItem[]; toRemove: CellItem[]; toMove: CellItem[] }[],
    game: any
) => {
    for (const res of results) {

        game.data.cells.sort((a: CellItem, b: CellItem) => {
            if (a.row === b.row) return a.column - b.column;
            else return a.row - b.row;
        });
        if (!game.data.matched)
            game.data.matched = [];
        const { toCreate, toChange, toRemove, toMove } = res;
        if (toRemove) {
            const rids: number[] = toRemove.map((c: CellItem) => c.id);
            const acells: CellItem[] = game.data.cells.filter((c: CellItem) => !rids.includes(c.id));
            game.data.cells.length = 0;
            game.data.cells.push(...acells);

            for (const r of toRemove) {
                const mitem = game.data.matched.find((m: { asset: number; quantity: number }) => m.asset === r.asset);
                if (mitem) mitem.quantity++;
                else game.data.matched.push({ asset: r.asset, quantity: 1 });
            }
        }
        if (toCreate?.length > 0) {
            game.data.cells.push(...toCreate);
        }

        if (toChange) {
            toChange.forEach((c) => {
                const cell = game.data.cells.find((s: CellItem) => s.id === c.id);
                Object.assign(cell, c);
            });
        }

        if (toMove) {
            for (const m of toMove) {
                const cell = game.data.cells.find((c: CellItem) => c.id === m.id);
                if (cell) Object.assign(cell, m);
            }
        }
    }

};
export const countRewards = (tournament: Tournament, battle: BattleModel): BattleReward[] => {
    const rewards: BattleReward[] = [];
    if (battle.games && battle.games.length > 0) {
        const uncomplete = battle.games.findIndex((g: any) => !g.status);
        if (uncomplete < 0)
            battle.games.sort((a: any, b: any) => {
                if (!a.score || !a.score.total) return -1;
                if (!b.score || !b.score.total) return 1;
                return a.score.total - b.score.total
            }).forEach((r: any, index: number) => {
                const reward = tournament.rewards?.find((w) => w.rank === index);
                if (reward) {
                    rewards.push({ uid: r.uid, gameId: r.gameId, rank: index, score: r.score?.total ?? 0, points: reward.points, assets: reward.assets })
                }
            })
    }
    return rewards;
}
export const executeAct = (game: GameModel, battle: BattleModel, action: { name: string; data: any }): any => {
    let result;

    switch (action.name) {
        case GAME_ACTION.SWIPE_CANDY: {
            const { row, column } = battle.data;
            const { candyId, targetId } = action.data;
            result = executeSwipe(game, candyId, targetId, row, column);
            break;
        }
        default:
            break;
    }
    return result;
}
const executeSwipe = (game: GameModel, candyId: number, targetId: number, row: number, column: number): SwipeResult | null => {
    const candy: CellItem | null = game.data.cells.find((c: CellItem) => c.id === candyId);
    const target: CellItem | null = game.data.cells.find((c: CellItem) => c.id === targetId);
    if (!candy || !target) return null;
    [candy.row, target.row] = [target.row, candy.row];
    [candy.column, target.column] = [target.column, candy.column];
    const results: { toChange: CellItem[]; toCreate?: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[] = [];
    const data: SwipeResult = { candy: JSON.parse(JSON.stringify(candy)), target: JSON.parse(JSON.stringify(target)), results };
    let loop = true

    while (loop) {
        game.data.cells.sort((a: CellItem, b: CellItem) => a.row !== b.row ? a.row - b.row : a.column - b.column)
        const grid: CellItem[][] = Array.from({ length: row }, () => Array(column).fill(null));

        for (const unit of game.data.cells) {
            grid[unit.row][unit.column] = unit;
        }
        const matches: Match[] = checkMatches(grid);
        if (matches.length === 0) {
            loop = false
            break;
        }

        const result: { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] } | null = processMatch(game, matches);
        if (result)
            results.push(result)
    }
    game.data.cells.sort((a: CellItem, b: CellItem) => {
        if (a.row !== b.row)
            return a.row - b.row
        else
            return a.column - b.column
    })
    return data;
}
const processMatch = (game: any, matches: Match[]): { toMove: CellItem[]; toRemove: CellItem[]; toCreate: CellItem[]; toChange: CellItem[] } | null => {

    const changed: CellItem[] = [];
    const moved: CellItem[] = [];
    const toCreate: CellItem[] = [];

    // const removed: CellItem[] = [];

    matches.filter((match) => match.size > 3).forEach((m) => {
        m.items[0].units.sort((a, b) => (a.row + a.column) - (b.row + b.column));
        const start = m.items[0].units[0];
        const end = m.items[0].units[m.items[0].units.length - 1];
        // removed.push(Object.assign({}, start, { id: -1 }))
        if (m.items[0].orientation === "horizontal") {
            [start.column, end.column] = [end.column, start.column]
            end.asset = 28;
        } else {
            [start.row, end.row] = [end.row, start.row]
            end.asset = 29;
        }
        end.status = 0;
        changed.push(end)

    })

    const removed: CellItem[] = game.data.cells.filter((c: CellItem) => c.status && c.status > 0);
    removed.sort((a, b) => (a.row + a.column) - (b.row + b.column))

    for (const r of removed) {
        const candy = getFreeCandy(game.seed, game.data.lastCellId++);

        if (candy) {
            candy.column = r.column;
            candy.row = -1;
            toCreate.push(candy);
            game.data.cells.push(candy)
        }

        const moves = game.data.cells.filter((c: CellItem) => c.column === r.column && c.row < r.row && !c.status);
        if (moves.length > 0) {
            moves.forEach((m: CellItem) => {
                m.row = m.row + 1;
                if (moved.findIndex((a) => a.id === m.id) < 0)
                    moved.push(m)
            })
        }
        if (!game.data.matched)
            game.data.matched = [];
        const mitem = game.data.matched.find((m: { asset: number; quantity: number }) => m.asset === r.asset);
        if (mitem) mitem.quantity++;
        else game.data.matched.push({ asset: r.asset, quantity: 1 });
    }
    game.data.cells = game.data.cells.filter((c: CellItem) => !c.status);
    const toMove = JSON.parse(JSON.stringify(moved))
    const toRemove = JSON.parse(JSON.stringify(removed));
    const toChange = JSON.parse(JSON.stringify(changed));
    const res = { toRemove, toChange, toMove, toCreate }
    return res

}





