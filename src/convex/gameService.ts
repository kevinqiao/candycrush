import { v } from "convex/values";
import { CellItem } from "../model/CellItem";
import { GAME_ACTION, GAME_EVENT } from "../model/Constants";
import candy_textures from "../model/candy_textures";
import * as gameEngine from "../service/GameEngine";
import { Match, checkMatches, initGame, settleGame } from "../service/GameEngine";
import * as Utils from "../util/Utils";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { action, internalMutation, internalQuery, query } from "./_generated/server";
const COLUMN = 7;
const ROW = 8;
interface SwipeResult {
    candy: CellItem;
    target: CellItem;
    results: { toChange: CellItem[]; toCreate?: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[];
}
interface SmashResult {
    candyId: number;
    results: { toChange: CellItem[]; toCreate?: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[];
}
const getFreeCandy = (seed: string, cellId: number) => {
    const random = Utils.getNthRandom(seed, cellId);
    // const index = Math.floor(random * (candy_textures.length - 10));
    const index = Math.floor(random * 10);
    const asset = candy_textures[index]["id"] ?? 0;
    const candy = { id: cellId, asset, column: -1, row: -1 };
    return candy
}
const executeSwipe = (game: any, candyId: number, targetId: number): SwipeResult => {
    const candy = game.cells.find((c: CellItem) => c.id === candyId);
    const target = game.cells.find((c: CellItem) => c.id === targetId);
    [candy.row, target.row] = [target.row, candy.row];
    [candy.column, target.column] = [target.column, candy.column];
    const results: { toChange: CellItem[]; toCreate?: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[] = [];
    const data: SwipeResult = { candy: JSON.parse(JSON.stringify(candy)), target: JSON.parse(JSON.stringify(target)), results };

    while (true) {
        game.cells.sort((a: CellItem, b: CellItem) => a.row !== b.row ? a.row - b.row : a.column - b.column)
        const grid: CellItem[][] = Array.from({ length: ROW }, () => Array(COLUMN).fill(null));
        for (const unit of game.cells) {
            grid[unit.row][unit.column] = unit;
        }
        const matches: Match[] = checkMatches(grid);
        if (matches.length === 0)
            break;
        const result: { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] } | null = processMatch(game, matches);
        if (result)
            results.push(result)
    }
    game.cells.sort((a: CellItem, b: CellItem) => {
        if (a.row !== b.row)
            return a.row - b.row
        else
            return a.column - b.column
    })
    return data;
}
const executeSmash = (game: any, candyId: number): SmashResult => {
    const results: any[] = [];
    const data: SmashResult = { candyId, results };
    const smashRes: { cell: CellItem; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] } | null = processSmash(game, candyId);
    if (smashRes != null) {
        results.push(smashRes)
        while (true) {
            game.cells.sort((a: CellItem, b: CellItem) => a.row !== b.row ? a.row - b.row : a.column - b.column)
            const grid: CellItem[][] = Array.from({ length: ROW }, () => Array(COLUMN).fill(null));
            for (const unit of game.cells) {
                grid[unit.row][unit.column] = unit;
            }
            const matches: any | null = checkMatches(grid);
            if (matches.length === 0)
                break;
            const result: any = processMatch(game, matches);
            results.push(result)
        }

        game.cells.sort((a: CellItem, b: CellItem) => {
            if (a.row !== b.row)
                return a.row - b.row
            else
                return a.column - b.column
        })
    }
    return data;
}
const processSmash = (game: any, cellId: number): { cell: CellItem, toRemove: CellItem[]; toCreate: CellItem[], toMove: CellItem[] } | null => {
    let toRemove: CellItem[] = [];
    const toCreate: CellItem[] = [];
    const toMove: CellItem[] = [];
    const candy = game.cells.find((c: CellItem) => c.id === cellId);
    if (!candy) return null;
    const cell: CellItem = JSON.parse(JSON.stringify(candy));

    if (cell.asset === 28) {
        toRemove = game.cells.filter((c: CellItem) => c.row === cell.row);
        for (let r of toRemove) {
            r.status = 1;
            const candy = getFreeCandy(game.seed, game.lastCellId++);
            if (candy) {
                candy.column = r.column;
                candy.row = -1;
                toCreate.push(JSON.parse(JSON.stringify(candy)));
                game.cells.push(candy)
            }
        }
        const moved = game.cells.filter((c: CellItem) => c.row < cell.row);
        if (moved.length > 0) {
            moved.forEach((m: CellItem) => {
                m.row = m.row + 1;
                toMove.push(JSON.parse(JSON.stringify(m)));
            })
        }
    } else if (cell.asset === 29) {
        toRemove = game.cells.filter((c: CellItem) => c.column === cell.column);
        for (let r of toRemove) {
            r.status = 1;
            const candy = getFreeCandy(game.seed, game.lastCellId++);
            if (candy) {
                candy.column = r.column;
                candy.row = r.row;
                toCreate.push(candy);
                toMove.push(candy)
                game.cells.push(candy)
            }
        }
    } else if (cell.asset === 30) {
        toRemove = game.cells.filter((c: CellItem) => c.row <= cell.row + 1 && c.row >= cell.row - 1 && c.column >= cell.column - 1 && c.column <= cell.column + 1);
        for (let r of toRemove) {
            r.status = 1;
            const candy = getFreeCandy(game.seed, game.lastCellId++);
            if (candy) {
                candy.column = r.column;
                candy.row = -1;
                toCreate.push(JSON.parse(JSON.stringify(candy)));
                game.cells.push(candy)
            }
            const moves = game.cells.filter((c: CellItem) => c.column === r.column && c.row < r.row);
            if (moves.length > 0) {
                moves.forEach((m: CellItem) => {
                    m.row = m.row + 1;
                    if (toMove.findIndex((a) => a.id === m.id) < 0)
                        toMove.push(m)
                })
            }
        }

    }
    for (let r of toRemove) {
        const mitem = game.matched.find((m: { asset: number; quantity: number }) => m.asset === r.asset);
        if (mitem) mitem.quantity++;
        else game.matched.push({ asset: r.asset, quantity: 1 });
    }
    game.cells = game.cells.filter((c: CellItem) => !c.status)
    return { cell, toCreate, toMove, toRemove };

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

    const removed: CellItem[] = game.cells.filter((c: CellItem) => c.status && c.status > 0);
    removed.sort((a, b) => (a.row + a.column) - (b.row + b.column))
    for (let r of removed) {
        const candy = getFreeCandy(game.seed, game.lastCellId++);
        if (candy) {
            candy.column = r.column;
            candy.row = -1;
            toCreate.push(candy);
            game.cells.push(candy)
        }

        const moves = game.cells.filter((c: CellItem) => c.column === r.column && c.row < r.row && !c.status);
        if (moves.length > 0) {
            moves.forEach((m: CellItem) => {
                m.row = m.row + 1;
                if (moved.findIndex((a) => a.id === m.id) < 0)
                    moved.push(m)
            })
        }

        const mitem = game.matched.find((m: { asset: number; quantity: number }) => m.asset === r.asset);
        if (mitem) mitem.quantity++;
        else game.matched.push({ asset: r.asset, quantity: 1 });
    }
    game.cells = game.cells.filter((c: CellItem) => !c.status);

    const toMove = JSON.parse(JSON.stringify(moved))
    const toRemove = JSON.parse(JSON.stringify(removed));
    const toChange = JSON.parse(JSON.stringify(changed));
    const res = { toRemove, toChange, toMove, toCreate }
    return res

}

export const findInitGame = internalQuery({
    args: { uid: v.string(), trend: v.number() },
    handler: async (ctx, { uid, trend }) => {

        const gameseeds = await ctx.db.query("gameseeds").take(100);
        const index = Utils.getRandom(gameseeds.length - 1);
        const games = await ctx.db.query("games").filter((q) => q.eq(q.field("seed"), gameseeds[index]['seed'])).take(10);

        if (games.length > 0) {
            const game = games[0]
            const event = await ctx.db
                .query("events")
                .filter((q) => q.and(q.eq(q.field("gameId"), game._id), q.eq(q.field("name"), "gameInited")))
                .first();
            if (event) {
                return { ...event?.data, seed: game?.seed, _id: undefined, gameId: game['_id'] }
            }
        }
    }
})
export const createInitGame = internalMutation({
    args: { uid: v.string() },
    handler: async (ctx, { uid }) => {
        const game = initGame(ROW, COLUMN);
        const gameseed = await ctx.db.query("gameseeds")
            .filter((q) => q.eq(q.field("seed"), game.seed)).first()
        if (!gameseed) {
            await ctx.db.insert("gameseeds", { seed: game.seed, top: 0, bottom: 0, average: 0, counts: 0 });
        }
        return game

    }
})
export const doAct = action({
    args: { act: v.string(), gameId: v.id("games"), data: v.any() },
    handler: async (ctx, { act, gameId, data }) => {
       
        const game = await ctx.runQuery(internal.games.getGame, { gameId });
        if (!game || game.status) return;
        if (!game.matched) game.matched = [];
        let steptime = Math.round(Date.now() - game['_creationTime']);
        switch (act) {
            case GAME_ACTION.SWIPE_CANDY:
                console.log("execute swipe")
                const sresult = executeSwipe(game, data.candyId, data.targetId);
                await ctx.runMutation(internal.events.create, {
                    name: "cellSwapped", gameId, data: sresult, steptime
                })
                break;
            case GAME_ACTION.SMASH_CANDY:
                const mresult = executeSmash(game, data.candyId);
                await ctx.runMutation(internal.events.create, {
                    name: "cellSmeshed", gameId, data: mresult, steptime
                })
                break;
            case GAME_ACTION.USE_SKILL:
                break;
            default:
                break;
        }

        if (gameEngine.checkGoalComplete(game.goal, game.matched)) {
            game.endTime = Date.now();
            const result: { base: number; time: number; goal: number } = gameEngine.countFinalScore(game);
            const score = result.base + result.time + result.goal;
            game.result = result;
            game.score = score;
            game.status = 1;
            await ctx.runMutation(internal.events.create, {
                name: "gameOver", gameId, data: { result, score: game.score, endTime: game.endTime }, steptime
            })

            const battle = await ctx.runMutation(internal.battle.settleGame, { battleId: game.battleId as Id<"battle">, gameId, uid: game.uid, score });
            if (battle && battle.status) {                
                await ctx.runMutation(internal.events.create, {
                    name: "battleOver", battleId: battle._id, data: battle.rewards, steptime
                })
            }
        }
        await ctx.runMutation(internal.games.update, {
            gameId, data: { ...game, laststep: steptime }
        });
    }
})
export const swipeCell = action({
    args: { gameId: v.id("games"), candyId: v.number(), targetId: v.number() },
    handler: async (ctx, args) => {

        const game = await ctx.runQuery(internal.games.getGame, { gameId: args.gameId });

        if (game && !game.status) {
            if (!game.matched)
                game.matched = [];

            const candy = game.cells.find((c: CellItem) => c.id === args.candyId);
            const target = game.cells.find((c: CellItem) => c.id === args.targetId);
            [candy.row, target.row] = [target.row, candy.row];
            [candy.column, target.column] = [target.column, candy.column];
            let steptime = Math.round(Date.now() - game['_creationTime']);

            const results: { toChange: CellItem[]; toCreate?: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[] = [];
            const data = { candy: JSON.parse(JSON.stringify(candy)), target: JSON.parse(JSON.stringify(target)), results };


            while (true) {
                game.cells.sort((a: CellItem, b: CellItem) => a.row !== b.row ? a.row - b.row : a.column - b.column)
                const grid: CellItem[][] = Array.from({ length: ROW }, () => Array(COLUMN).fill(null));
                for (const unit of game.cells) {
                    grid[unit.row][unit.column] = unit;
                }
                const matches: Match[] = checkMatches(grid);
                if (matches.length === 0)
                    break;
                const result: { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] } | null = processMatch(game, matches);
                if (result)
                    results.push(result)
            }

            game.cells.sort((a: CellItem, b: CellItem) => {
                if (a.row !== b.row)
                    return a.row - b.row
                else
                    return a.column - b.column
            })
            await ctx.runMutation(internal.events.create, {
                name: "cellSwapped", gameId: args.gameId, data, steptime
            })
            if (gameEngine.checkGoalComplete(game.goal, game.matched)) {
                game.endTime = Date.now();
                const result: { base: number; time: number; goal: number } = gameEngine.settleGame(game);
                const score = result.base + result.time + result.goal;
                game.result = result;
                game.score = score;
                game.status = 1;
                await ctx.runMutation(internal.events.create, {
                    name: "gameOver", gameId: args.gameId, data: { result, score: game.score, endTime: game.endTime }, steptime
                })
            }
            await ctx.runMutation(internal.games.update, {
                gameId: args.gameId, data: { ...game, laststep: steptime }
            });
            // await ctx.runMutation(internal.games.log, {
            //     gameId: args.gameId, cells: game.cells
            // });


        }
    }
})
export const smash = action({
    args: { gameId: v.id("games"), candyId: v.number() },
    handler: async (ctx, { gameId, candyId }) => {
        console.log("smash cell:" + candyId)
        const game = await ctx.runQuery(internal.games.getGame, { gameId });

        if (game) {

            if (!game.matched)
                game.matched = [];
            let steptime = Math.round(Date.now() - game['_creationTime']);
            const smashRes: { cell: CellItem; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] } | null = processSmash(game, candyId);
            if (smashRes != null) {
                console.log("smash results with candy:" + smashRes.cell.id + " asset:" + smashRes.cell.asset)

                const results = [];
                results.push(smashRes)
                while (true) {
                    game.cells.sort((a: CellItem, b: CellItem) => a.row !== b.row ? a.row - b.row : a.column - b.column)
                    const grid: CellItem[][] = Array.from({ length: ROW }, () => Array(COLUMN).fill(null));
                    for (const unit of game.cells) {
                        grid[unit.row][unit.column] = unit;
                    }
                    const matches: any | null = checkMatches(grid);
                    if (matches.length === 0)
                        break;
                    const result: any = processMatch(game, matches);
                    results.push(result)
                }


                game.cells.sort((a: CellItem, b: CellItem) => {
                    if (a.row !== b.row)
                        return a.row - b.row
                    else
                        return a.column - b.column
                })
                await ctx.runMutation(internal.games.update, {
                    gameId, data: { cells: game.cells, matched: game.matched, lastCellId: game.lastCellId, laststep: steptime }
                });
                await ctx.runMutation(internal.games.log, {
                    gameId, cells: game.cells
                });

                if (results.length > 0)
                    await ctx.runMutation(internal.events.create, {
                        name: "cellSmeshed", gameId, data: { candyId, results }, steptime
                    })
            }
        }
    }
})
export const findFreeCandies = query({
    args: { gameId: v.id("games") },
    handler: async (ctx, { gameId }) => {
        const game = await ctx.db.get(gameId);
        if (game?.lastCellId) {
            const candies = [];
            for (let i = 0; i < 20; i++) {
                const candy = getFreeCandy(game.seed, game.lastCellId)
                candies.push(candy)
            }
            return candies;
        }
        return []
    }
})

export const checkPlay = action({
    handler: async (ctx) => {
        const tosettles = await ctx.runQuery(internal.games.findTosettledGames);
        tosettles.forEach(async (s) => {
            if (!s.endTime)
                s.endTime = s.startTime;
            const result: { base: number; time: number; goal: number } = settleGame(s);
            const score = result.base + result.time + result.goal;
            await ctx.runMutation(internal.games.update, { gameId: s._id, data: { result, score, status: 1 } })
        })

    },
});


export const checkAgent = action({
    handler: async (ctx) => {
        const games = await ctx.runQuery(internal.games.findAgentGames);
        for (let game of games) {
            if (!game.ref) return;
            const start = game.laststep ?? 0;
            const end = Date.now() - game._creationTime;
            const events = await ctx.runQuery(internal.events.getStepEvents, { gameId: game.ref, start, end })
            if (events.length > 0) {
                let laststep = start;
                for (let event of events) {
                    if (event.name === GAME_EVENT.GAME_OVER) {
                        Object.assign(game, event.data, { status: 1 });
                        //create game over event
                        await ctx.runMutation(internal.events.create, {
                            name: "gameOver", gameId: game._id, steptime: event.steptime, data: event.data
                        })
                        break;
                    } else {
                        laststep = event.steptime ?? laststep;
                        gameEngine.handleEvent(event.name, event.data, game);
                    }
                }
                if (laststep > start) {
                    await ctx.runMutation(internal.games.update, { gameId: game._id, data: game })
                }
            }

        }
    }
});
