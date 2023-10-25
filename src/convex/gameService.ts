import { v } from "convex/values";
import { CellItem } from "../model/CellItem";
import candy_textures from "../model/candy_textures";
import * as gameEngine from "../service/GameEngine";
import * as RandomUtil from "../util/Utils";
import { internal } from "./_generated/api";
import { action, internalMutation, internalQuery, query } from "./_generated/server";

const getFreeCandies = (seed: string, startCellId: number, quantity: number) => {
    const candies: CellItem[] = [];
    for (let i = 0; i < quantity; i++) {

        const random = RandomUtil.getNthRandom(seed, startCellId);
        const index = Math.floor(random * (candy_textures.length - 10));
        const asset = candy_textures[index]["id"] ?? 0;
        candies.push({ id: startCellId, asset, column: -1, row: -1 });
        startCellId++;
    }
    return candies
}
export const findInitGame = internalQuery({
    args: { uid: v.string(), trend: v.number() },
    handler: async (ctx, { uid, trend }) => {

        const gameseeds = await ctx.db.query("gameseeds").take(100);
        const index = RandomUtil.getRandom(gameseeds.length - 1);
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
        const game = gameEngine.initGame();
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
            const freeCandies = getFreeCandies(game.seed, game.lastCellId ?? 1, 20);
            const candy = game.cells.find((c: CellItem) => c.id === args.candyId);
            const target = game.cells.find((c: CellItem) => c.id === args.targetId);
            [candy.row, target.row] = [target.row, candy.row];
            [candy.column, target.column] = [target.column, candy.column];
            let steptime = Math.round(Date.now() - game['_creationTime']);
            await ctx.runMutation(internal.events.create, {
                name: "cellSwapped", gameId: args.gameId, steptime, data: { candy, target }
            });
            // const allResults: any[] = [];
            const allResults: any[] = gameEngine.processSwapped(game, freeCandies);
            // let count = 0;
            // while (true) {
            //     count++;
            //     const matches: MatchModel[] | undefined = gameEngine.getMatches(game.cells);

            //     if (matches && matches.length > 0) {

            //         const rs = gameEngine.processMatches(game.cells, matches);

            //         if (rs?.toRemove) {
            //             const toCreate: CellItem[] = [];
            //             for (let i = 0; i < COLUMN; i++) {
            //                 const size = rs.toRemove.filter((c) => c.column === i).length;
            //                 for (let j = 0; j < size; j++) {
            //                     const random = RandomUtil.getNthRandom(game.seed, game.lastCellId ?? 0);
            //                     const index = Math.floor(random * (candy_textures.length - 10));
            //                     const asset = candy_textures[index]["id"] ?? 0;
            //                     const cell = {
            //                         asset,
            //                         column: i,
            //                         id: game.lastCellId ? game.lastCellId++ : 0,
            //                         row: j,
            //                     };
            //                     toCreate.push(cell);
            //                 }
            //             }
            //             rs['toCreate'] = toCreate;
            //         }

            //         const res = gameEngine.applyMatches({ cells: game.cells, matched: game.matched ?? [] }, rs);
            //         game.cells = res.cells;
            //         game.matched = res.matched;

            //         allResults.push({ id: count, ...rs, score: res.score });

            //     } else {
            //         break;
            //     }
            // }
            steptime = Math.round(Date.now() - game["_creationTime"])
            game.cells.sort((a: CellItem, b: CellItem) => {
                if (a.row !== b.row)
                    return a.row - b.row
                else
                    return a.column - b.column
            })
            await ctx.runMutation(internal.games.update, {
                gameId: args.gameId, data: { cells: game.cells, matched: game.matched, lastCellId: game.lastCellId, laststep: steptime }
            });
            await ctx.runMutation(internal.games.log, {
                gameId: args.gameId, cells: game.cells
            });

            await ctx.runMutation(internal.events.create, {
                name: "matchSolved", gameId: args.gameId, lastCellId: game.lastCellId, data: allResults, steptime
            })
        }
    }
})
export const findFreeCandies = query({
    args: { gameId: v.id("games") },
    handler: async (ctx, { gameId }) => {
        const game = await ctx.db.get(gameId);
        if (game?.lastCellId) {
            return getFreeCandies(game.seed, game.lastCellId, 20);
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
                    game.cells = gameEngine.applyMatches(game.cells, res);
                    await ctx.runMutation(internal.games.update, {
                        gameId, data: { cells: game.cells, laststep: steptime }
                    });
                }

            }

            await ctx.runMutation(internal.events.create, { name, gameId, steptime, data })
        }

    }
})
