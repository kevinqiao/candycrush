import seedrandom from 'seedrandom';
import goals from "../component/play/goals";
import { BattleModel, BattleReward } from '../model/Battle';
import { CellItem } from "../model/CellItem";
import { BATTLE_DURATION, CANDY_MATCH_TYPE, GAME_ACTION, GAME_EVENT } from '../model/Constants';
import { GameModel } from '../model/GameModel';
import { Tournament } from '../model/Tournament';
import candy_textures from "../model/candy_textures";
import * as Utils from "../util/Utils";
interface SwipeResult {
    candy: CellItem;
    target: CellItem;
    results: { toChange: CellItem[]; toCreate?: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[];
}

// const COLUMN = 7;
// const ROW = 8;
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
export const checkSwipe = (grid: CellItem[][]): boolean => {
    // const grid: CellItem[][] = Array.from({ length: rows }, () => Array(columns).fill(null));
    // for (const unit of cells) {
    //     grid[unit.row][unit.column] = unit;
    // }
    const rows = grid.length;
    const columns = grid[0].length;
    for (let row = 0; row < rows; row++) {
        let col = 0;
        let start = grid[row][0];
        let units: CellItem[] = [];
        while (col < columns) {
            if (!grid[row][col])
                console.log("row:" + row + ";col:" + col + " is null")
            if (grid[row][col].asset === start.asset) {
                units.push(grid[row][col])
            } else {
                if (units.length >= 3) {
                    return true;
                }
                start = grid[row][col]
                units = [start]
            }
            col++; // Move to the next column if no match was found
        }
        if (units.length >= 3) {
            return true
        }
    }

    for (let col = 0; col < columns; col++) {
        let row = 0;
        let start = grid[0][col];
        let units: CellItem[] = [];
        while (row < rows) {
            // console.log(col + "," + row + ";" + grid[row][col].asset + ":" + start.asset + ":" + units.length)
            if (grid[row][col].asset === start.asset) {
                units.push(grid[row][col])
            } else {
                if (units.length >= 3) {
                    return true;
                }
                start = grid[row][col]
                units = [start]
            }
            row++; // Move to the next column if no match was found
        }
        if (units.length >= 3) {
            return true;
        }
    }

    return false;
}
export const findMatches = (grid: CellItem[][]): MatchItem[] => {

    const rows = grid.length;
    const columns = grid[0].length;
    const matches: MatchItem[] = [];
    for (let row = 0; row < rows; row++) {
        let col = 0;
        let start = grid[row][0];
        let units: CellItem[] = [];
        while (col < columns) {
            if (!grid[row][col])
                console.log("row:" + row + ";col:" + col + " is null")
            if (grid[row][col].asset === start.asset) {
                units.push(grid[row][col])
            } else {
                if (units.length >= 3) {
                    matches.push({ units: [...units], start: { row: start.row, column: start.column }, end: { row: row, column: col - 1 }, orientation: "horizontal" })
                }
                start = grid[row][col]
                units = [start]
            }
            col++; // Move to the next column if no match was found
        }
        if (units.length >= 3) {
            matches.push({ units: [...units], start: { row: start.row, column: start.column }, end: { row: row, column: col - 1 }, orientation: "horizontal" })
        }
    }

    for (let col = 0; col < columns; col++) {
        let row = 0;
        let start = grid[0][col];
        let units: CellItem[] = [];
        while (row < rows) {
            // console.log(col + "," + row + ";" + grid[row][col].asset + ":" + start.asset + ":" + units.length)
            if (grid[row][col].asset === start.asset) {
                units.push(grid[row][col])
            } else {
                if (units.length >= 3) {
                    matches.push({ units: [...units], start: { row: start.row, column: start.column }, end: { row: row - 1, column: col }, orientation: "vertical" })
                }
                start = grid[row][col]
                units = [start]
            }
            row++; // Move to the next column if no match was found
        }
        if (units.length >= 3) {
            matches.push({ units: [...units], start: { row: start.row, column: start.column }, end: { row: row - 1, column: col }, orientation: "vertical" })
        }
    }

    return matches;
}

export const checkMatches = (grid: CellItem[][]): Match[] => {
    console.log("start checking...")
    const allmatches: MatchItem[] = findMatches(grid);
    console.log("all size:" + allmatches.length)
    const matches4: Match[] = getMatchPlus4(allmatches);
    const specials: Match[] = getSpecials(allmatches);

    const matches3: MatchItem[] = allmatches.filter((m) => !m.status)
    const matches: Match[] = [];
    for (const m of matches3) {
        m.status = 1;
        m.units.forEach((u) => u.status = 1);
        matches.push({ type: CANDY_MATCH_TYPE.LINE, size: 3, items: [m] })
    }
    matches.push(...matches4);
    matches.push(...specials)
    return matches
}
export const getMatchPlus4 = (matches: MatchItem[]): Match[] => {
    const matches4: Match[] = [];
    let loop = true;
    while (loop) {
        const m4 = matches.filter((m) => !m.status && m.units.length >= 4).sort((a, b) => {
            return b.units.length - a.units.length
        })
        if (m4.length === 0) {
            loop = false;
            break;
        }
        for (const m of m4) {
            const ms: number[] = [];
            m.units.forEach((u, index) => {
                if (u.status)
                    ms.push(index)
            })
            if (ms.length > 0) {
                for (let i = 0; i < ms.length; i++) {
                    const len = ms[i + 1] - ms[i];
                    if (len >= 2) {
                        const units = m.units.slice(ms[i], ms[i + 1])
                        const item = {
                            units,
                            start: { row: units[0].row, column: units[0].column },
                            end: { row: units[len - 1].row, column: units[len - 1].column },
                            orientation: m.orientation
                        }
                        if (len === 2) {
                            matches.push(item)
                        } else {
                            item.units.forEach((u) => u.status = 1)
                            matches4.push({ type: CANDY_MATCH_TYPE.LINE, size: units.length, items: [item] });
                        }
                    }
                }
            } else {
                m.units.forEach((u) => u.status = 1)
                matches4.push({ type: CANDY_MATCH_TYPE.LINE, size: m.units.length, items: [m] });
            }
            m.status = 1;
        }
    }
    return matches4

}

export const getSpecials = (matches: MatchItem[]): Match[] => {
    const matches3: MatchItem[] = matches.filter((m) => {
        const us = m.units.filter((u) => u.status);
        if (!m.status && us.length === 0 && m.units.length === 3)
            return true;
        else
            return false;
    })
    const specials: Match[] = [];
    const vmatches: MatchItem[] = matches3.filter(m => m.orientation === 'vertical');
    const hmatches: MatchItem[] = matches3.filter(m => m.orientation === 'horizontal');
    for (const vmatch of vmatches) {
        if (vmatch.units.filter((u) => !u.status).length === 3) {
            for (const hmatch of hmatches) {
                const len = hmatch.units.filter((u) => !u.status).length;
                if (len === 3 && hmatch.start.row >= vmatch.start.row &&
                    hmatch.start.row <= vmatch.end.row &&
                    vmatch.start.column >= hmatch.start.column &&
                    vmatch.start.column <= hmatch.end.column) {
                    const verticalAtEndpoint = hmatch.start.row === vmatch.end.row && (hmatch.start.column === vmatch.end.column ||
                        hmatch.end.column === vmatch.end.column);

                    const verticalAtStartpoint = hmatch.start.row === vmatch.start.row && (hmatch.start.column === vmatch.start.column ||
                        hmatch.end.column === vmatch.start.column);
                    console.log(verticalAtEndpoint + ":" + verticalAtStartpoint)
                    const mtype = verticalAtEndpoint || verticalAtStartpoint ? CANDY_MATCH_TYPE.LMODEL : CANDY_MATCH_TYPE.TMODEL;

                    if (mtype) {
                        vmatch.status = 1;
                        hmatch.status = 1;
                        specials.push({ type: mtype, size: 5, items: [vmatch, hmatch] });
                        vmatch.units.forEach((u) => u.status = 1)
                        hmatch.units.forEach((u) => u.status = 1);
                    }
                }
            }
        }
    }
    return specials
}



export const initGame = (defender: any, seed: string) => {
    const { row, column } = defender as { row: number; column: number };
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

// export const initGame = (row: number, column: number) => {
//     const seed = Utils.getRandomSeed(10);
//     return createGame(row, column, seed)
// }


// export const applyMatches = (
//     gameObj: { matched: { asset: number; quantity: number }[]; cells: CellItem[] },
//     results: { id?: number; toMove?: CellItem[]; toChange?: CellItem[]; toRemove?: CellItem[]; toCreate?: CellItem[] }
// ) => {
//     const game: { matched: { asset: number; quantity: number }[]; cells: CellItem[] } = JSON.parse(JSON.stringify(gameObj))
//     const { toRemove, toMove, toChange, toCreate } = results;
//     if (toRemove) {
//         game.cells = game.cells.filter((c) => toRemove.findIndex((r) => r.id === c.id) < 0)
//     }
//     if (toChange) {
//         toChange.forEach((c) => {
//             const cell = game.cells.find((s) => s.id === c.id);
//             if (cell)
//                 Object.assign(cell, c);
//             console.log(cell)
//         })
//     }
//     if (toMove) {
//         toMove.forEach((c) => {
//             const cell = game.cells.find((s) => s.id === c.id);
//             if (cell)
//                 Object.assign(cell, c);
//         })
//     }
//     if (toCreate) {
//         game.cells = [...game.cells, ...toCreate]
//     }
//     return game
// }


// export const countFinalScore = (game: any): { base: number; time: number; goal: number } => {
//     const baseScore = game.matched.reduce((s: number, a: { asset: number; quantity: number }) => s + a.quantity, 0);
//     const startTime = game._creationTime
//     const saveSeconds = Math.floor((600000 - (game.endTime - startTime)) / 1000);
//     const timeScore = saveSeconds * 10;
//     const goalModel = goals.find((g: { id: number, goal: { asset: number, quantity: number }[] }) => g.id === game.goal);
//     const result = { base: baseScore, time: timeScore, goal: 0 }
//     if (goalModel) {
//         const goalSuccess = goalModel.goal.map((g) => {
//             const m = game.matched.find((m: { asset: number; quantity: number }) => m.asset === g.asset);
//             const quantity = m ? g.quantity - m.quantity : g.quantity;
//             return { asset: g.asset, quantity };
//         }).every((r) => r.quantity <= 0);
//         if (goalSuccess)
//             result.goal = 1000;
//     }
//     return result
// }
export const settleGame = (game: any): { base: number; time: number; goal: number } | null | undefined => {
    let result;
    let goalScore = -1;
    const goalModel = goals.find((g: { id: number, goal: { asset: number, quantity: number }[] }) => g.id === game.goal);
    if (goalModel) {
        const goalSuccess = goalModel.goal.map((g) => {
            const m = game.matched.find((m: { asset: number; quantity: number }) => m.asset === g.asset);
            const quantity = m ? g.quantity - m.quantity : g.quantity;
            return { asset: g.asset, quantity };
        }).every((r) => r.quantity <= 0);
        if (goalSuccess) {
            goalScore = 1000;
        }
    }
    const playTime = Date.now() - game.startTime;
    if ((playTime - BATTLE_DURATION) >= 0 || goalScore >= 0) {
        const baseScore = game.matched.reduce((s: number, a: { asset: number; quantity: number }) => s + a.quantity, 0);
        const timeScore = (BATTLE_DURATION - playTime) * 10;
        result = { base: baseScore, time: timeScore >= 0 ? timeScore : 0, goal: goalScore >= 0 ? goalScore : 0 }
    }
    return result
}

export const countBaseScore = (matched: { asset: number, quantity: number }[]): number => {
    if (matched)
        return matched.reduce((s: number, a: { asset: number; quantity: number }) => s + a.quantity, 0);
    return 0;
}
export const countGoalAndScore = (results: any[], matched: { asset: number; quantity: number }[], goalId: number) => {
    let from = matched.reduce((s: number, a: { asset: number; quantity: number }) => s + a.quantity, 0);
    const goalModel = goals.find((g: { id: number, goal: { asset: number, quantity: number }[] }) => g.id === goalId);

    if (goalModel) {

        const preGoal = goalModel.goal.map((g) => {
            const m = matched.find((m) => m.asset === g.asset);
            const quantity = m ? g.quantity - m.quantity : g.quantity;
            return { asset: g.asset, quantity };
        })

        const gassets = goalModel.goal.map((g) => g.asset);
        for (const res of results) {
            const { toRemove }: { toRemove: CellItem[] } = res;
            const toCollect: CellItem[] = toRemove.filter((c: CellItem) => gassets.includes(c.asset));
            if (toCollect.length > 0) {
                res.toCollect = toCollect;
                const toGoal: { asset: number; start: number; end: number }[] = [];
                for (const g of preGoal) {
                    const size = toCollect.filter((c) => c.asset === g.asset).length;
                    if (size > 0) {
                        const end = Math.max(g.quantity - size, 0);
                        toGoal.push({ asset: g.asset, start: g.quantity, end });
                        g.quantity = end
                    }
                }
                res.toGoal = toGoal;
            }
            const to = from + toRemove.length;
            res.toScore = { from, to }
            from = to;
        }
    }

}
export const handleEvent = (name: string, eventData: any, game: any) => {
    console.log(game)
    if (name === GAME_EVENT.SWIPE_CANDY) {
        const candy: CellItem | undefined = game.data.cells.find((c: CellItem) => c.id === eventData.candy.id);
        const target: CellItem | undefined = game.data.cells.find((c: CellItem) => c.id === eventData.target.id);
        if (candy && target) {
            [candy.row, target.row] = [target.row, candy.row];
            [candy.column, target.column] = [target.column, candy.column];
        }
    }
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
const getFreeCandy = (seed: string, cellId: number) => {
    const random = Utils.getNthRandom(seed, cellId);
    // const index = Math.floor(random * (candy_textures.length - 10));
    const index = Math.floor(random * 10);
    const asset = candy_textures[index]["id"] ?? 0;
    const candy = { id: cellId, asset, column: -1, row: -1 };
    return candy
}




