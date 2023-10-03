import { v } from "convex/values";
import { CellItem } from "../model/CellItem";
import { COLUMN } from "../model/Constants";
import { MatchModel } from "../model/MatchModel";
import candy_textures from "../model/candy_textures";
import * as gameEngine from "../service/GameEngine";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";

export const initGame = action({
    args: { uid: v.string() },
    handler: async (ctx, args) => {

        const cells = gameEngine.initGame();
        const gameId: string = await ctx.runMutation(internal.games.create, { game: { uid: args.uid, cells, lastCellId: cells.length + 1 } });
        await ctx.runMutation(internal.events.create, {
            name: "gameInited", uid: "kqiao", gameId, data: { gameId, cells }
        });

    }
})
export const swipeCell = action({
    args: { gameId: v.id("games"), candyId: v.number(), targetId: v.number() },
    handler: async (ctx, args) => {

        const game = await ctx.runQuery(internal.games.findGame, { gameId: args.gameId });

        if (game) {
            const candy = game.cells.find((c: CellItem) => c.id === args.candyId);
            const target = game.cells.find((c: CellItem) => c.id === args.targetId);
            [candy.row, target.row] = [target.row, candy.row];
            [candy.column, target.column] = [target.column, candy.column];
            let steptime = Math.round(Date.now() - game['_creationTime']);
            await ctx.runMutation(internal.events.create, {
                name: "cellSwapped", gameId: args.gameId, steptime, data: { candy, target }
            });
            const allResults: any[] = [];
            let count = 0;
            while (true) {
                count++;
                const matches: MatchModel[] | undefined = gameEngine.getMatches(game.cells);

                if (matches && matches.length > 0) {

                    const rs = gameEngine.processMatches(game.cells, matches);
                    if (rs?.toRemove) {
                        const toCreate: CellItem[] = [];
                        for (let i = 0; i < COLUMN; i++) {
                            const size = rs.toRemove.filter((c) => c.column === i).length;
                            for (let j = 0; j < size; j++) {
                                const index = Math.floor(Math.random() * (candy_textures.length - 10));
                                const asset = candy_textures[index]["id"] ?? 0;
                                const cell = {
                                    asset,
                                    column: i,
                                    id: game.lastCellId++,
                                    row: j,
                                };
                                toCreate.push(cell);
                            }
                        }
                        rs['toCreate'] = toCreate;
                    }

                    game.cells = gameEngine.applyMatches(game.cells, rs);

                    allResults.push({ id: count, ...rs });

                } else {
                    break;
                }
            }

            game.cells.sort((a: CellItem, b: CellItem) => {
                if (a.row !== b.row)
                    return a.row - b.row
                else
                    return a.column - b.column
            })
            await ctx.runMutation(internal.games.update, {
                gameId: args.gameId, cells: game.cells, lastCellId: game.lastCellId
            });
            await ctx.runMutation(internal.games.log, {
                gameId: args.gameId, cells: game.cells
            });
            steptime = Math.round(Date.now() - game["_creationTime"])
            await ctx.runMutation(internal.events.create, {

                name: "matchSolved", gameId: args.gameId, data: allResults, steptime
            })
        }
    }
})