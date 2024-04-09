import goals from "../component/play/goals";
import { BattleModel, BattleReward } from '../model/Battle';
import { CellItem } from "../model/CellItem";
import { GAME_ACTION, GAME_EVENT, GAME_STATUS } from '../model/Constants';
import { GameModel } from '../model/GameModel';
import { Tournament } from '../model/Tournament';
import { findMatch3, findMatch3Plus, findMove, getFreeCandy, getRandomAsset } from '../util/MatchGameUtils';
import { getRandom, getRandomSeed } from '../util/Utils';
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

export const createGame = (diffcult: { column: number; row: number; chunk: number; goal: number }): { seed: string; data: { cells: CellItem[]; lastCellId: number } } | null => {
    const { row, column } = diffcult;
    const grid: CellItem[][] = [];
    let done = false;
    let id = 0;
    let gameData: { seed: string; data: { cells: CellItem[]; lastCellId: number } } | null = null;
    let seed = getRandomSeed(10);

    while (!done) {

        for (let y = 0; y < row; y++) {
            grid[y] = [];
            for (let x = 0; x < column; x++) {
                const asset: number = getRandomAsset(seed, id);
                grid[y][x] = { id, row: y, column: x, asset }
                id++;
            }
        }
        // const matches = findMatch3(grid);
        // console.log("match size:" + matches.length)
        gameData = { seed, data: { cells: grid.flatMap((r) => r), lastCellId: id } }

        resolveMatch(gameData, row, column);
        // console.log(result)
        // matches = findMatch3(grid);

        const moves: { candy: CellItem, target: CellItem }[] = findMove(gameData.data.cells, row, column);
        console.log("moves size:" + moves.length)
        if (moves.length > 1)
            done = true;
        else
            seed = getRandomSeed(10);
    }
    return gameData
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
        applyShiftResult(result, game.data)
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
    if (!game.seed) return;
    const result: { data: any; result: any } = { data: null, result: null }
    const { row, column } = battle.data;
    const results: { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[]; toSmesh: CellItem[] }[] = []
    const smeshIds = [28, 29, 30, 31]
    switch (action.name) {
        case GAME_ACTION.SWIPE_CANDY: {
            const { candyId, targetId } = action.data;
            const candy: CellItem | null = game.data.cells.find((c: CellItem) => c.id === candyId);
            const target: CellItem | null = game.data.cells.find((c: CellItem) => c.id === targetId);
            if (!candy || !target) return null;
            [candy.row, target.row] = [target.row, candy.row];
            [candy.column, target.column] = [target.column, candy.column];
            result['data'] = { candy, target };

            if (smeshIds.includes(candy['asset'])) {
                if (smeshIds.includes(target['asset'])) {
                    let casset = -1
                    if (candy.asset === 31) {
                        const r = getRandom(7)
                        const c = getRandom(7);
                        const t = game.data.cells.find((cell: any) => cell.row === r && cell.column === c);
                        casset = t.asset;
                    }
                    let res = resolveSmash({ seed: game.seed, data: game.data }, row, column, candy, casset);
                    results.push(res)
                    if (target.asset === 31) {
                        const r = getRandom(7)
                        const c = getRandom(7);
                        const t = game.data.cells.find((cell: any) => cell.row === r && cell.column === c);
                        casset = t.asset;
                    }
                    res = resolveSmash({ seed: game.seed, data: game.data }, row, column, target, casset);
                    results.push(res)
                } else {
                    const casset = candy.asset === 31 ? target.asset : -1;
                    resolveSmash({ seed: game.seed, data: game.data }, row, column, candy, casset)
                }
            } else if (smeshIds.includes(target['asset'])) {
                const casset = target.asset === 31 ? candy.asset : -1;
                resolveSmash({ seed: game.seed, data: game.data }, row, column, target, casset)
            }

            break;
        }
        default:
            break;
    }
    return result;
}

export const resolveSmash = (gameData: { seed: string; data: { cells: CellItem[]; lastCellId: number } }, rows: number, columns: number, candy: CellItem, asset: number): { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[]; toSmesh: CellItem[] } => {

    gameData.data.cells.sort((a: CellItem, b: CellItem) => a.row !== b.row ? a.row - b.row : a.column - b.column)
    const grid: CellItem[][] = Array.from({ length: rows }, () => Array(columns).fill(null));
    for (const unit of gameData.data.cells) {
        grid[unit.row][unit.column] = { ...unit };
    }

    const plus4changes = solveMatch(grid, 5, 7);
    const crossChanges = solveCrossMatch(grid);
    const fourChanges = solveMatch(grid, 3, 4);
    const toChange = [...plus4changes, ...crossChanges, ...fourChanges];
    const toSmesh: CellItem[] = [];
    switch (candy.asset) {
        case 28:
            grid[candy.column].forEach((c) => {
                c.status = 1;
                toSmesh.push(c)
            })
            break;
        case 29:
            grid[candy.row].forEach((c) => {
                c.status = 1;
                toSmesh.push(c)
            })
            break;
        case 30:
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const row = i + candy['row'];
                    const col = j + candy['column'];
                    if (row >= 0 && col >= 0) {
                        grid[row][col].status = 1;
                        toSmesh.push(grid[row][col])
                    }
                }
            }

            break;
        case 31:
            if (asset) {
                const smeshs: CellItem[] = gameData.data.cells.filter((c: CellItem) => c.asset === asset);
                toSmesh.push(...smeshs);
            }
            break;
        default:
            break;
    }

    const res = shiftMatch(gameData.seed, gameData.data, grid);

    const result = { ...res, toChange, toSmesh };
    applyShiftResult(result, gameData.data);

    return result

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
    const matches: MatchItem[] = findMatch3(grid);

    if (matches.length > 1) {

        for (const match of matches) {
            if (!match.status) {
                const ls = matches.find((m) => match.id !== m.id && !m.status && m.units.find((obj1) => match.units.some(obj2 => obj1['id'] === obj2['id'])));

                if (ls) {
                    const conn = match.units.find((mu) => ls.units.some((lu) => lu.id === mu.id));
                    if (conn) {
                        toChange.push({ ...conn, asset: 30 });
                        match.units.forEach((u) => {
                            if (u.id !== conn.id)
                                u.status = 1
                        });
                        ls.units.forEach((u) => {
                            if (u.id !== conn.id)
                                u.status = 1
                        });
                        ls.status = 1;
                    }
                }
                match.status = 1;
            }
        }
    }

    return toChange;
}
const solveCrossMatch = (grid: CellItem[][]): CellItem[] => {
    const toChange: CellItem[] = [];
    const matches: MatchItem[] = findMatch3(grid);

    for (const match of matches) {
        if (!match.status) {
            const ls = matches.find((m) => match.id !== m.id && !m.status && m.units.find((obj1) => match.units.some(obj2 => obj1['id'] === obj2['id'])));

            if (ls) {
                const conn = match.units.find((mu) => ls.units.some((lu) => lu.id === mu.id));
                if (conn) {
                    toChange.push({ ...conn, asset: 30 });
                    match.units.forEach((u) => {
                        if (u.id !== conn.id)
                            u.status = 1
                    });
                    ls.units.forEach((u) => {
                        if (u.id !== conn.id)
                            u.status = 1
                    });
                    ls.status = 1;
                }
            }
            match.status = 1;
        }
    }
    return toChange;
}
const solveSmesh = (grid: CellItem[][], candy: CellItem, target: number, allMeshes: { target: number; candy: CellItem; smesh?: CellItem[] }[]) => {
    const row = grid.length;
    const column = grid[0].length;
    const smeshIds = [28, 29, 30, 31];
    switch (candy.asset) {
        case 28:
            allMeshes.push({ target, candy });
            for (let i = 0; i < row; i++) {
                const c = grid[i][candy.column];
                c.status = 1;
                if (smeshIds.includes(c.asset))
                    solveSmesh(grid, c, -1, allMeshes)
            }

            break;
        case 29:
            allMeshes.push({ target, candy });
            for (let i = 0; i < column; i++) {
                const c = grid[candy.row][i];
                c.status = 1;
                if (smeshIds.includes(c.asset))
                    solveSmesh(grid, c, -1, allMeshes)
            }
            break;
        case 30:
            {
                const smesh: CellItem[] = [];
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const row = i + candy['row'];
                        const col = j + candy['column'];
                        if (row >= 0 && col >= 0) {
                            if (smeshIds.includes(grid[row][col].asset))
                                solveSmesh(grid, grid[row][col], -1, allMeshes)
                            smesh.push(grid[row][col])
                        }
                    }
                }
                smesh.push(candy)
                smesh.forEach((c) => c.status = 1);
                allMeshes.push({ target, candy, smesh })
            }
            break;
        case 31:
            {
                let asset = target;
                if (target < 0) {
                    const candies = grid.flatMap((r) => r);
                    const cs = candies.filter((c) => !c.status);
                    const c = candies[getRandom(cs.length)];
                    asset = c.asset;
                }
                const smesh = [...grid.flatMap((r) => r).filter((c: CellItem) => c.asset === asset), candy];
                smesh.forEach((c) => c.status = 1)
                allMeshes.push({ target, candy, smesh })
            }
            break;
        default:
            break;
    }
    return;
}

const shiftMatch = (seed: string, data: { lastCellId: number }, grid: CellItem[][]) => {
    const toMove: CellItem[] = [];
    const toCreate: CellItem[] = [];
    const columns = grid[0].length;
    const cells = grid.flatMap((row) => row)
    for (let column = 0; column < columns; column++) {
        const toColCreate: CellItem[] = [];
        const colRemoved = cells.filter((c: any) => c.column === column && c.status);
        for (const r of colRemoved) {
            const candy = getFreeCandy(seed, data.lastCellId++);
            candy.column = column;
            candy.row = toColCreate.length;
            toColCreate.push(candy);
            const toMoves: CellItem[] = cells.filter((c: CellItem) => !c.status && c.column === column && c.row < r.row);
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

    const toRemove: CellItem[] = cells.filter((c: CellItem) => c.status);
    return { toRemove, toCreate, toMove }

}

const applyShiftResult = (
    result: { toCreate: CellItem[]; toChange: CellItem[]; toRemove: CellItem[]; toMove: CellItem[] },
    data: { cells: CellItem[] }
) => {


    data.cells.sort((a: CellItem, b: CellItem) => {
        if (a.row === b.row) return a.column - b.column;
        else return a.row - b.row;
    });

    const { toCreate, toChange, toRemove, toMove } = result;
    if (toRemove) {
        const acells: CellItem[] = data.cells.filter((c: CellItem) => {
            const cr = toRemove.find((r) => r.id === c.id);
            if (cr) return false;
            else return true;
        });
        data.cells.length = 0;
        data.cells.push(...acells);
    }
    if (toCreate?.length > 0) {
        data.cells.push(...toCreate);
    }

    if (toChange) {
        toChange.forEach((c) => {
            const cell = data.cells.find((s: CellItem) => s.id === c.id);
            if (cell)
                cell.asset = c.asset;
        });
    }

    if (toMove) {
        for (const m of toMove) {
            const cell = data.cells.find((c: CellItem) => c.id === m.id);
            if (cell) {
                cell.column = m.column;
                cell.row = m.row;
            }
        }
    }
};


