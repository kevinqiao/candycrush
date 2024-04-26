import { v } from "convex/values";
import { BattleModel } from "../model/Battle";
import { CellItem } from "../model/CellItem";
import { GAME_EVENT, getEventByAction } from "../model/Constants";
import * as GameEngine from "../service/GameEngine";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { sessionAction } from "./custom/session";


export const doAct = sessionAction({
    args: { act: v.string(), gameId: v.string(), data: v.any() },
    handler: async (ctx, { act, gameId, data }) => {
        // console.log(ctx.user)
        // console.log(data)
        // console.log("do action:" + act)
        const game: any = await ctx.runQuery(internal.games.getGame, { gameId: gameId as Id<"games"> });
        if (!game || !game?.battleId) return;

        const battle: BattleModel | undefined | null = await ctx.runQuery(internal.battle.find, { battleId: game.battleId as Id<"battle"> });
        if (!battle?.data || !battle.startTime) return;

        const actionResult: { data: any; result: any; gameData: { lastCellId: number; matched: CellItem[], moves?: number, skillBuff?: { skill: number; quantity: number }[] } } = GameEngine.executeAct(game, battle, { name: act, data });
        if (actionResult) {
            const eventName = getEventByAction(act);
            console.log("event name:" + eventName)
            const steptime = Math.round(Date.now() - battle['startTime']);
            if (eventName)
                await ctx.runMutation(internal.events.create, {
                    name: eventName, gameId, data: { ...actionResult.data, results: actionResult.result, gameData: { ...game.data, cells: undefined } }, steptime
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



