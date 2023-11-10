import { v } from "convex/values";
import { CellItem } from "../model/CellItem";
import candy_textures from "../model/candy_textures";
import { Match, applyMatches, checkMatches, initGame } from "../service/GameEngine";
import * as Utils from "../util/Utils";
import { internal } from "./_generated/api";
import { action, internalMutation, internalQuery, query } from "./_generated/server";
const getFreeCandy = (seed: string, cellId: number) => {
    const random = Utils.getNthRandom(seed, cellId);
    const index = Math.floor(random * (candy_textures.length - 10));
    const asset = candy_textures[index]["id"] ?? 0;
    const candy = { id: cellId, asset, column: -1, row: -1 };
    return candy
}
const processSmash = (game: any, cellId: number): { cell: CellItem, toRemove: CellItem[]; toCreate: CellItem[], toMove: CellItem[] } => {
    let removed: CellItem[] = [];
    const created: CellItem[] = [];
    let moved: CellItem[] = [];
    const cell: CellItem = game.cells.find((c: CellItem) => c.id === cellId);
    console.log("process smesh on candy:" + cellId)
    console.log(cell.asset)

    if (cell.asset === 28) {
        removed = game.cells.filter((c: CellItem) => c.row === cell.row);
        for (let r of removed) {
            r.status = 1;
            const candy = getFreeCandy(game.seed, game.lastCellId++);
            if (candy) {
                candy.column = r.column;
                candy.row = -1;
                created.push(candy);
                game.cells.push(candy)
            }
        }
        moved = game.cells.filter((c: CellItem) => c.row < cell.row);
        if (moved.length > 0) {
            moved.forEach((m: CellItem) => {
                m.row = m.row + 1;
            })
        }
    } else if (cell.asset === 29) {
        removed = game.cells.filter((c: CellItem) => c.column === cell.column);
        for (let r of removed) {
            r.status = 1;
            const candy = getFreeCandy(game.seed, game.lastCellId++);

            if (candy) {
                candy.column = r.column;
                candy.row = r.row;
                created.push(candy);
                game.cells.push(candy)
            }
        }
    } else if (cell.asset === 30) {
        removed = game.cells.filter((c: CellItem) => c.row <= cell.row + 1 && c.row >= cell.row - 1 && c.column >= cell.column - 1 && c.column <= cell.column + 1);
        for (let r of removed) {
            r.status = 1;
            const candy = getFreeCandy(game.seed, game.lastCellId++);
            if (candy) {
                candy.column = r.column;
                candy.row = -1;
                created.push(candy);
                game.cells.push(candy)
            }
        }
        moved = game.cells.filter((c: CellItem) => c.row < cell.row - 1 && c.column >= cell.column - 1 && c.column <= cell.column + 1);
        if (moved.length > 0) {
            moved.forEach((m: CellItem) => {
                m.row = m.row + 1;
            })
        }
    }
    game.cells = game.cells.filter((c: CellItem) => !c.status)
    return { cell, toCreate: created, toMove: moved, toRemove: removed };

}
const processMatch = (game: any, matches: Match[]): { toMove: CellItem[]; toRemove: CellItem[]; toCreate: CellItem[]; toChange: CellItem[] } | null => {

    const toChange: CellItem[] = [];
    const toMove: CellItem[] = [];
    const toCreate: CellItem[] = [];
    const toRemove: CellItem[] = [];

    matches.filter((match) => match.size > 3).forEach((m) => {
        m.items[0].units.sort((a, b) => (a.row + a.column) - (b.row + b.column));
        const start = m.items[0].units[0];
        const end = m.items[0].units[m.items[0].units.length - 1];
        if (m.items[0].orientation === "horizontal") {
            [start.column, end.column] = [end.column, start.column]
            end.asset = 28;
        } else {
            [start.row, end.row] = [end.row, start.row]
            end.asset = 29;
        }
        end.status = 0;
        toChange.push(JSON.parse(JSON.stringify(end)))

    })

    const removes: CellItem[] = game.cells.filter((c: CellItem) => c.status && c.status > 0);
    for (let r of removes) {
        const candy = getFreeCandy(game.seed, game.lastCellId++);
        if (candy) {
            toRemove.push(JSON.parse(JSON.stringify(r)))
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

        const mitem = game.matched.find((m: { asset: number; quantity: number }) => m.asset === r.asset);
        if (mitem) mitem.quantity++;
        else game.matched.push({ asset: r.asset, quantity: 1 });
    }
    game.cells = game.cells.filter((c: CellItem) => !c.status);

    const res = { toRemove, toChange, toMove: JSON.parse(JSON.stringify(toMove.filter((c) => !c.status))), toCreate }
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
        const game = initGame();
        const gameseed = await ctx.db.query("gameseeds")
            .filter((q) => q.eq(q.field("seed"), game.seed)).first()
        if (!gameseed) {
            await ctx.db.insert("gameseeds", { seed: game.seed, top: 0, bottom: 0, average: 0, counts: 0 });
        }
        return game

    }
})
export const swipeCell = action({
    args: { gameId: v.id("games"), candyId: v.number(), targetId: v.number() },
    handler: async (ctx, args) => {

        const game = await ctx.runQuery(internal.games.getGame, { gameId: args.gameId });

        if (game) {
            if (!game.matched)
                game.matched = [];
            const candy = game.cells.find((c: CellItem) => c.id === args.candyId);
            const target = game.cells.find((c: CellItem) => c.id === args.targetId);
            [candy.row, target.row] = [target.row, candy.row];
            [candy.column, target.column] = [target.column, candy.column];
            let steptime = Math.round(Date.now() - game['_creationTime']);

            // await ctx.runMutation(internal.events.create, {
            //     name: "cellSwapped", gameId: args.gameId, steptime, data: { candy, target }
            // })

            const results: { toChange: CellItem[]; toCreate?: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[] = [];
            const data = { candy: JSON.parse(JSON.stringify(candy)), target: JSON.parse(JSON.stringify(target)), results };

            let count = 0;
            while (true) {
                count++;
                const matches: Match[] = checkMatches(game.cells);
                if (matches.length === 0 || count > 10)
                    break;
                const result: { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] } | null = processMatch(game, matches);
                if (result)
                    results.push(result)
            }
            // steptime = Math.round(Date.now() - game["_creationTime"])
            game.cells.sort((a: CellItem, b: CellItem) => {
                if (a.row !== b.row)
                    return a.row - b.row
                else
                    return a.column - b.column
            })
            // game.cells.forEach((c: CellItem) => {
            //     console.log(c.row + ":" + c.column + ":" + c.asset)
            // })
            await ctx.runMutation(internal.games.update, {
                gameId: args.gameId, data: { cells: game.cells, matched: game.matched, lastCellId: game.lastCellId, laststep: steptime }
            });
            await ctx.runMutation(internal.games.log, {
                gameId: args.gameId, cells: game.cells
            });

            await ctx.runMutation(internal.events.create, {
                name: "cellSwapped", gameId: args.gameId, lastCellId: game.lastCellId, data, steptime
            })
        }
    }
})
export const smash = action({
    args: { gameId: v.id("games"), candyId: v.number() },
    handler: async (ctx, { gameId, candyId }) => {
        console.log("smash cell:" + candyId)
        const game = await ctx.runQuery(internal.games.getGame, { gameId });

        if (game) {
            console.log("smash game:" + gameId + " on cell:" + candyId)
            if (!game.matched)
                game.matched = [];
            let steptime = Math.round(Date.now() - game['_creationTime']);

            const smashRes: { cell: CellItem; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] } = processSmash(game, candyId);
            if (smashRes) {
                console.log("smash results with candy:" + smashRes.cell.id + " asset:" + smashRes.cell.asset)
                // await ctx.runMutation(internal.events.create, {
                //     name: "cellSmashed", gameId: gameId, lastCellId: game.lastCellId, steptime, data: smashRes
                // })
                const results = [];
                results.push(smashRes)
                let count = 0;
                while (true) {
                    count++;
                    const matches: any | null = checkMatches(game.cells);
                    if (matches.length === 0 || count > 10)
                        break;
                    const result: any = processMatch(game, matches);
                    results.push(result)
                }
                console.log("count:" + count + ";" + results.length)

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
                        name: "cellSmeshed", gameId, lastCellId: game.lastCellId, data: { candyId, results }, steptime
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
export const syncClock = query({
    args: {},
    handler: async (ctx, args) => {
        return Date.now();
    }
})
export const applyEvent = action({
    args: { name: v.string(), gameId: v.id("games"), steptime: v.number(), data: v.any() },
    handler: async (ctx, { name, gameId, steptime, data }) => {
        const game = await ctx.runQuery(internal.games.getGame, { gameId });
        if (game) {
            if (name === "cellSwapped") {
                // const cells = game.cells as CellItem[];
                const candy: CellItem | undefined = game.cells.find((c: CellItem) => c.id === data.candy.id);
                const target: CellItem | undefined = game.cells.find((c: CellItem) => c.id === data.target.id);
                if (candy && target) {
                    [candy.row, target.row] = [target.row, candy.row];
                    [candy.column, target.column] = [target.column, candy.column];
                    await ctx.runMutation(internal.games.update, {
                        gameId, data: { cells: game.cells, laststep: steptime }
                    });
                }
            } else if (name === "matchSolved") {
                for (let res of data as any[]) {
                    game.cells = applyMatches(game.cells, res);
                    await ctx.runMutation(internal.games.update, {
                        gameId, data: { cells: game.cells, laststep: steptime }
                    });
                }

            }

            await ctx.runMutation(internal.events.create, { name, gameId, steptime, data })
        }

    }
})
