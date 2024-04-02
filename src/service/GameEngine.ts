import seedrandom from 'seedrandom';
import goals from "../component/play/goals";
import { BattleModel, BattleReward } from '../model/Battle';
import { CellItem } from "../model/CellItem";
import { GAME_ACTION, GAME_EVENT, GAME_STATUS } from '../model/Constants';
import { GameModel } from '../model/GameModel';
import { Tournament } from '../model/Tournament';
import candy_textures from "../model/candy_textures";
import { findMatch3, findMatch3Plus, getFreeCandy, hasMatch } from '../util/MatchGameUtils';
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
    id?: number;
    units: CellItem[];
    start: { row: number; column: number };
    end: { row: number; column: number };
    orientation: 'horizontal' | 'vertical' | 'T' | 'L';
    size: number;
    status?: number;//0-active 1-inactive
};


export const initGame = (diffcult: any, seed: string) => {
    const { row, column } = diffcult.data as { row: number; column: number };
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




export const settleGame = (game: any, battle: any, goalId: number): { base: number; time: number; goal: number } | null => {

    let result = null;
    let goalScore = 0;
    // const goalId = battle.data.goal;
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
        const timeLeft = battle.duration - Date.now() + battle.startTime;

        if (timeLeft < 0 || goalScore > 0) {
            const baseScore = game.data.matched.reduce((s: number, a: { asset: number; quantity: number }) => s + a.quantity, 0);
            const timeScore = timeLeft > 0 ? Math.floor(timeLeft * 2 / 1000) : 0;
            const score = baseScore + timeScore + goalScore;
            result = { base: baseScore, time: timeScore, goal: goalScore }
            game['result'] = result;
            game['score'] = score;
            game['status'] = GAME_STATUS.SETTLED;
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
    // applyEventResult(eventData.results, game)
    for (const result of eventData.results) {
        applyShiftResult(result, game)
    }
}

export const countRewards = (tournament: Tournament, battle: BattleModel): BattleReward[] => {
    const rewards: BattleReward[] = [];
    if (battle.status === 0 && battle.games && battle.games.length > 0) {
        battle.games.sort((a: any, b: any) => b.score - a.score).forEach((r: any, index: number) => {

            const reward = tournament.rewards?.find((w) => w.rank === index);
            console.log(reward)
            if (reward) {
                rewards.push({ uid: r.uid, gameId: r._id, rank: index, score: r.score, points: reward.points, assets: reward.assets });
            } else
                rewards.push({ uid: r.uid, gameId: r._id, rank: index, score: r.score, points: 0, assets: [] });
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
    console.log("start resolve match....")
    const results = resolveMatch(game, row, column);

    game.data.cells.sort((a: CellItem, b: CellItem) => {
        if (a.row !== b.row)
            return a.row - b.row
        else
            return a.column - b.column
    })
    return { candy: JSON.parse(JSON.stringify(candy)), target: JSON.parse(JSON.stringify(target)), results }
    // return data;
}

const resolveMatch = (game: GameModel, rows: number, columns: number) => {
    const results: { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[] = [];
    game.data.cells.sort((a: CellItem, b: CellItem) => a.row !== b.row ? a.row - b.row : a.column - b.column)
    let grid: CellItem[][] = Array.from({ length: rows }, () => Array(columns).fill(null));
    for (const unit of game.data.cells) {
        grid[unit.row][unit.column] = unit;
    }

    while (hasMatch(grid)) {

        // console.log("matched is happend")
        const m3plusChanges = resolveMatch3Plus(grid);
        const crossChanges = resolveMatchCross(grid);
        const match3 = findMatch3(grid);

        if (match3?.length > 0) {
            match3.forEach((m) => m.units.forEach((u) => u.status = 1))
        }
        const res = shiftMatch(rows, columns, game);
        const result = { ...res, toChange: [...m3plusChanges, ...crossChanges] };
        results.push(result)
        applyShiftResult(result, game);

        game.data.cells.sort((a: CellItem, b: CellItem) => a.row !== b.row ? a.row - b.row : a.column - b.column)
        grid = Array.from({ length: rows }, () => Array(columns).fill(null));
        for (const unit of game.data.cells) {
            grid[unit.row][unit.column] = unit;
        }
        console.log("shift completed and sort grid again,cell size:" + game.data.cells.length)
    }

    return results
}

const resolveMatch3Plus = (grid: CellItem[][]): CellItem[] => {
    const toChange: CellItem[] = [];
    let matches: MatchItem[] = findMatch3Plus(grid);
    // console.log("m3plus size:" + matches?.length)
    while (matches.length > 0) {
        for (const m of matches) {
            if (m.units.filter((u) => u.status).length === 0) {
                if (m.size === 4) {
                    toChange.push({ ...m.units[0], asset: m.orientation === "horizontal" ? 28 : 29 })
                } else {
                    toChange.push({ ...m.units[0], asset: 31 })
                }
                m.units.forEach((u, index) => {
                    if (index > 0) u.status = 1
                })
            }
        }
        matches = findMatch3Plus(grid);
        console.log(" after resolved m3plus size:" + matches?.length)
    }
    return toChange;
}

const resolveMatchCross = (grid: CellItem[][]): CellItem[] => {
    const toChange: CellItem[] = [];
    let matches: MatchItem[] = findMatch3(grid);
    while (matches.length > 1) {
        for (const match of matches) {
            if (!match.status) {
                const ls = matches.find((m) => match.id !== m.id && !m.status && m.units.find((obj1) => match.units.some(obj2 => obj1['id'] === obj2['id'])));
                if (ls) {
                    const conn = match.units.find((mu) => ls.units.some((lu) => lu.id === mu.id));
                    if (conn) {
                        toChange.push({ ...conn, asset: 30 });
                        match.units.forEach((u) => u.status = 1);
                        ls.units.forEach((u) => u.status = 1);
                    }
                }
            }
        }
        matches = findMatch3(grid);
    }
    return toChange;
}
const shiftMatch = (rows: number, columns: number, game: any) => {
    const toMove: CellItem[] = [];
    const toCreate: CellItem[] = [];

    for (let column = 0; column < columns; column++) {
        const toColCreate: CellItem[] = [];
        const colRemoved = game.data.cells.filter((c: any) => c.column === column && c.status);
        for (const r of colRemoved) {
            const candy = getFreeCandy(game.seed, game.data.lastCellId++);
            candy.column = column;
            candy.row = toColCreate.length;
            toColCreate.push(candy);
            const toMoves: CellItem[] = game.data.cells.filter((c: CellItem) => !c.status && c.column === column && c.row < r.row);
            toMoves.forEach((ms) => {
                const tm = toMove.find((m) => m.id === ms.id);
                if (tm) {
                    tm.row++;
                } else
                    toMove.push({ ...ms, row: ms.row + 1 })
            })

        }
        toCreate.push(...toColCreate)
    }

    const toRemove: CellItem[] = game.data.cells.filter((c: CellItem) => c.status);
    return { toRemove, toCreate, toMove }

}

const applyShiftResult = (
    result: { toCreate: CellItem[]; toChange: CellItem[]; toRemove: CellItem[]; toMove: CellItem[] },
    game: GameModel
) => {


    game.data.cells.sort((a: CellItem, b: CellItem) => {
        if (a.row === b.row) return a.column - b.column;
        else return a.row - b.row;
    });
    if (!game.data.matched)
        game.data.matched = [];
    const { toCreate, toChange, toRemove, toMove } = result;
    if (toRemove) {
        const acells: CellItem[] = game.data.cells.filter((c: CellItem) => {
            const cr = toRemove.find((r) => r.id === c.id);
            if (cr) return false;
            else return true;
        });
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
            if (cell) {
                Object.assign(cell, m);
            }
        }
    }

    console.log("apply shift completed")

};


