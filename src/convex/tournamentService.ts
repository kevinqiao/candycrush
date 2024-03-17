import { v } from "convex/values";
import { BATTLE_COUNT_DOWN_TIME } from "../model/Constants";
import { initGame } from "../service/GameEngine";
import * as Utils from "../util/Utils";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";
export const join = action({
    args: { tid: v.string(), uid: v.string() },
    handler: async (ctx, { tid, uid }) => {
        //find the tournament  for the cost requirement
        //charge the cost of attend
        const qs = await ctx.runQuery(internal.matchqueue.finByUid, { uid });
        if (!qs) {
            await ctx.runMutation(internal.matchqueue.create, { uid, tournamentId: tid });
            return { ok: true }
        } else
            return { ok: false }
    }
})
export const joinTournamentByGroup = action({
    args: { tid: v.string(), uid: v.string() },
    handler: async (ctx, { tid, uid }) => {

        const diffcult = await ctx.runQuery(internal.diffcult.findByHardLevel, { level: 1, hard: 1 })
        const tournament = await ctx.runQuery(internal.tournaments.findById, { id: tid });

        if (tournament && diffcult) {
            // const battle = { tournamentId: tid, participants: tournament.participants, column: COLUMN, row: ROW, goal: 1, chunk: 10, searchDueTime: Date.now() + 2500, startTime: Date.now() + 15000 };
            // const searchDueTime = Date.now() + BATTLE_SEARCH_MAX_TIME;
            const startTime = Date.now() + BATTLE_COUNT_DOWN_TIME;
            const battle: any = { tournamentId: tid, participants: tournament.participants, diffcult: diffcult?.id, startTime, duration: tournament.battleTime };
            battle['duration'] = 60000;
            battle['endDueTime'] = startTime + battle['duration'];
            const battleId = await ctx.runMutation(internal.battle.create, battle);
            // const games = [];
            const seed = Utils.getRandomSeed(10);
            const gameInited = initGame(diffcult, seed)
            // const gameInited = tournament.participants === 2 ? await ctx.runMutation(internal.gameService.createInitGame, { uid }) : await ctx.runQuery(internal.gameService.findInitGame, { uid, trend: 1 });
            // let gameInited = await ctx.runQuery(internal.games.getInitGame, { gameId: "31wn8c5rrq08175n9x5ka9hb9kw8ej8" });
            if (gameInited) {
                const game = { diffcult: diffcult.id, battleId, tid, data: gameInited, seed, type: 0, laststep: 0 }
                // console.log("ref:" + game.ref)
                let gameId: string = await ctx.runMutation(internal.games.create, { game: { ...game, uid } });
                // games.push({ player: { uid, name: "kevin qiao", avatar: 1 }, uid, gameId });
                await ctx.runMutation(internal.events.create, {
                    name: "gameInited", gameId, data: { gameId, ...game }
                });
                const opponent = await ctx.runQuery(internal.user.findOpponent, { battleId })
                if (!opponent)
                    throw new Error("opponent not found")
                gameId = await ctx.runMutation(internal.games.create, { game: { ...game, uid: opponent.uid } });
                await ctx.runMutation(internal.events.create, {
                    name: "gameInited", gameId, data: { gameId, ...game }
                });
                // games.push({ player: { uid: opponent, name: "system", avatar: 2 }, uid: opponent, gameId });
                await ctx.runMutation(internal.events.create, {
                    name: "battleCreated", uid, data: { id: battleId }
                });
            }

        }
    }

})

