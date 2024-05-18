import { v } from "convex/values";
import { BattleModel } from "../model/Battle";
import { CellItem } from "../model/CellItem";
import { GAME_EVENT, getEventByAct } from "../model/Match3Constants";
import * as GameEngine from "../service/GameEngine";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { sessionAction } from "./custom/session";


export const doAct = sessionAction({
    args: { act: v.number(), gameId: v.string(), actionId: v.optional(v.number()), data: v.any() },
    handler: async (ctx, { act, gameId, actionId, data }) => {

        // console.log("do action:" + act + " actionId:" + actionId)
        const game: any = await ctx.runQuery(internal.games.getGame, { gameId: gameId as Id<"games"> });
        if (!game || !game?.battleId) return;

        const battle = await ctx.runQuery(internal.battle.find, { battleId: game.battleId as Id<"battle"> });
        if (!battle?.data || !battle.startTime) return;
        const battleModel: BattleModel = battle as BattleModel;

        const actionResult: { data: any; result: any; gameData: { lastCellId: number; matched: CellItem[], move?: number, skillBuff?: { skill: number; quantity: number }[] } } = GameEngine.executeAct(game, battleModel, { act, data });
        if (actionResult) {
            const eventName = getEventByAct(act);
            const steptime = Math.round(Date.now() - battle['startTime']);
            if (eventName)
                await ctx.runMutation(internal.events.create, {
                    name: eventName, gameId, actionId, data: { ...actionResult.data, results: actionResult.result, gameData: { ...game.data, cells: undefined } }, steptime
                })
            const diff = await ctx.runQuery(internal.diffcult.find, { id: game.diffcult })

            if (diff?.data) {
                game.data.cells.sort((a: CellItem, b: CellItem) => {
                    if (a.row !== b.row)
                        return a.row - b.row
                    else
                        return a.column - b.column
                })
                if (!game.data.goalCompleteTime && GameEngine.checkGoalComplete(game, diff.data.goal)) {
                    game.data.goalCompleteTime = battle.duration - Date.now() + game.startTime;
                    await ctx.runMutation(internal.events.create, {
                        name: GAME_EVENT.GOAL_COMPLETE, gameId, data: { data: game.data }, steptime
                    })
                }
                if (game.data.move >= diff.data.steps) {
                    game.result = GameEngine.settleGame(game);
                }

                await ctx.runMutation(internal.games.update, {
                    gameId: gameId as Id<"games">, data: { ...game, gameId: undefined, defender: undefined, laststep: steptime }
                });
                if (game.result) {
                    await ctx.runMutation(internal.events.create, {
                        name: GAME_EVENT.GAME_OVER, gameId, data: { result: game.result, score: game.score }, steptime
                    })
                }
                return { ok: true }
            }
        }
    }
})



