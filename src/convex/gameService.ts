import { v } from "convex/values";
import { BattleModel } from "../model/Battle";
import { CellItem } from "../model/CellItem";
import { GAME_EVENT, getEventByAction } from "../model/Constants";
import * as GameEngine from "../service/GameEngine";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { sessionAction } from "./custom/session";

// const executeSmash = (game: any, candyId: number): SmashResult => {
//     const results: any[] = [];
//     const data: SmashResult = { candyId, results };
//     const smashRes: { cell: CellItem; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] } | null = processSmash(game, candyId);
//     if (smashRes != null) {
//         results.push(smashRes)
//         while (true) {
//             game.cells.sort((a: CellItem, b: CellItem) => a.row !== b.row ? a.row - b.row : a.column - b.column)
//             const grid: CellItem[][] = Array.from({ length: ROW }, () => Array(COLUMN).fill(null));
//             for (const unit of game.cells) {
//                 grid[unit.row][unit.column] = unit;
//             }
//             const matches: any | null = checkMatches(grid);
//             if (matches.length === 0)
//                 break;
//             const result: any = processMatch(game, matches);
//             results.push(result)
//         }

//         game.cells.sort((a: CellItem, b: CellItem) => {
//             if (a.row !== b.row)
//                 return a.row - b.row
//             else
//                 return a.column - b.column
//         })
//     }
//     return data;
// }
// const processSmash = (game: any, cellId: number): { cell: CellItem, toRemove: CellItem[]; toCreate: CellItem[], toMove: CellItem[] } | null => {
//     let toRemove: CellItem[] = [];
//     const toCreate: CellItem[] = [];
//     const toMove: CellItem[] = [];
//     const candy = game.cells.find((c: CellItem) => c.id === cellId);
//     if (!candy) return null;
//     const cell: CellItem = JSON.parse(JSON.stringify(candy));

//     if (cell.asset === 28) {
//         toRemove = game.cells.filter((c: CellItem) => c.row === cell.row);
//         for (const r of toRemove) {
//             r.status = 1;
//             const candy = getFreeCandy(game.seed, game.lastCellId++);
//             if (candy) {
//                 candy.column = r.column;
//                 candy.row = -1;
//                 toCreate.push(JSON.parse(JSON.stringify(candy)));
//                 game.cells.push(candy)
//             }
//         }
//         const moved = game.cells.filter((c: CellItem) => c.row < cell.row);
//         if (moved.length > 0) {
//             moved.forEach((m: CellItem) => {
//                 m.row = m.row + 1;
//                 toMove.push(JSON.parse(JSON.stringify(m)));
//             })
//         }
//     } else if (cell.asset === 29) {
//         toRemove = game.cells.filter((c: CellItem) => c.column === cell.column);
//         for (const r of toRemove) {
//             r.status = 1;
//             const candy = getFreeCandy(game.seed, game.lastCellId++);
//             if (candy) {
//                 candy.column = r.column;
//                 candy.row = r.row;
//                 toCreate.push(candy);
//                 toMove.push(candy)
//                 game.cells.push(candy)
//             }
//         }
//     } else if (cell.asset === 30) {
//         toRemove = game.cells.filter((c: CellItem) => c.row <= cell.row + 1 && c.row >= cell.row - 1 && c.column >= cell.column - 1 && c.column <= cell.column + 1);
//         for (const r of toRemove) {
//             r.status = 1;
//             const candy = getFreeCandy(game.seed, game.lastCellId++);
//             if (candy) {
//                 candy.column = r.column;
//                 candy.row = -1;
//                 toCreate.push(JSON.parse(JSON.stringify(candy)));
//                 game.cells.push(candy)
//             }
//             const moves = game.cells.filter((c: CellItem) => c.column === r.column && c.row < r.row);
//             if (moves.length > 0) {
//                 moves.forEach((m: CellItem) => {
//                     m.row = m.row + 1;
//                     if (toMove.findIndex((a) => a.id === m.id) < 0)
//                         toMove.push(m)
//                 })
//             }
//         }

//     }
//     for (const r of toRemove) {
//         const mitem = game.matched.find((m: { asset: number; quantity: number }) => m.asset === r.asset);
//         if (mitem) mitem.quantity++;
//         else game.matched.push({ asset: r.asset, quantity: 1 });
//     }
//     game.cells = game.cells.filter((c: CellItem) => !c.status)
//     return { cell, toCreate, toMove, toRemove };

// }

export const doAct = sessionAction({
    args: { act: v.string(), gameId: v.string(), data: v.any() },
    handler: async (ctx, { act, gameId, data }) => {
        // console.log(ctx.user)
        console.log("do action:" + act)
        const game: any = await ctx.runQuery(internal.games.getGame, { gameId: gameId as Id<"games"> });
        if (!game || !game?.battleId) return;
        // if (!game.data.matched) game.data.matched = [];
        const battle: BattleModel | undefined | null = await ctx.runQuery(internal.battle.find, { battleId: game.battleId as Id<"battle"> });
        if (!battle?.data || !battle.startTime) return;


        // const matchResult: { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[] | undefined = GameEngine.resolveMatch({ seed: game.seed, data: game.data }, battle.data.row, battle.data.column)

        const actionResult: { data: any; result: any } = GameEngine.executeAct(game, battle, { name: act, data });
        if (actionResult) {
            const eventName = getEventByAction(act);
            const steptime = Math.round(Date.now() - battle['startTime']);
            if (eventName)
                await ctx.runMutation(internal.events.create, {
                    name: eventName, gameId, data: { ...actionResult.data, results: actionResult.result }, steptime
                })
            const diff = await ctx.runQuery(internal.diffcult.find, { id: game.diffcult })
            if (diff?.data) {
                game.data.cells.sort((a: CellItem, b: CellItem) => {
                    if (a.row !== b.row)
                        return a.row - b.row
                    else
                        return a.column - b.column
                })
                const result = GameEngine.settleGame(game, battle, diff.data.goal);
                if (result) {
                    await ctx.runMutation(internal.events.create, {
                        name: GAME_EVENT.GAME_OVER, gameId, data: { result, score: game.score }, steptime
                    })
                }

                await ctx.runMutation(internal.games.update, {
                    gameId: gameId as Id<"games">, data: { ...game, gameId: undefined, defender: undefined, laststep: steptime }
                });
            }
        }
    }
})



