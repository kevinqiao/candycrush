import { v } from "convex/values";
import { BATTLE_COUNT_DOWN_TIME, BATTLE_SEARCH_MAX_TIME } from "../model/Constants";
import { initGame } from "../service/GameEngine";
import * as Utils from "../util/Utils";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";

export const joinTournamentByGroup = action({
    args: { tid: v.string(), uid: v.string() },
    handler: async (ctx, { tid, uid }) => {

        const defender = await ctx.runQuery(internal.defender.findByHardLevel, { level: 1, hard: 1 })
        const tournament = await ctx.runQuery(internal.tournaments.findById, { id: tid });

        if (tournament && defender?.data) {
            // const battle = { tournamentId: tid, participants: tournament.participants, column: COLUMN, row: ROW, goal: 1, chunk: 10, searchDueTime: Date.now() + 2500, startTime: Date.now() + 15000 };
            const searchDueTime = Date.now() + BATTLE_SEARCH_MAX_TIME;
            const startTime = searchDueTime + BATTLE_COUNT_DOWN_TIME;
            const battle = { tournamentId: tid, participants: tournament.participants, data: { ...defender.data, _id: undefined, _creationTime: undefined }, searchDueTime, startTime, duration: tournament.battleTime };
            const battleId = await ctx.runMutation(internal.battle.create, battle);
            const games = [];
            const seed = Utils.getRandomSeed(10);
            const gameInited = initGame(defender, seed)
            // const gameInited = tournament.participants === 2 ? await ctx.runMutation(internal.gameService.createInitGame, { uid }) : await ctx.runQuery(internal.gameService.findInitGame, { uid, trend: 1 });
            // let gameInited = await ctx.runQuery(internal.games.getInitGame, { gameId: "31wn8c5rrq08175n9x5ka9hb9kw8ej8" });
            if (gameInited) {
                const game = { defender: defender.id, battleId, tid, data: gameInited, seed, type: 0, laststep: 0 }
                // console.log("ref:" + game.ref)
                let gameId: string = await ctx.runMutation(internal.games.create, { game: { ...game, uid } });
                games.push({ uid, gameId });
                await ctx.runMutation(internal.events.create, {
                    name: "gameInited", gameId, data: { gameId, ...game }
                });
                const opponent = "1"
                gameId = await ctx.runMutation(internal.games.create, { game: { ...game, uid: opponent } });
                await ctx.runMutation(internal.events.create, {
                    name: "gameInited", gameId, data: { gameId, ...game }
                });
                games.push({ uid: opponent, gameId });
                for (const game of games)
                    await ctx.runMutation(internal.events.create, {
                        name: "battleCreated", uid: game.uid, data: { games, id: battleId, ...battle, data: { ...defender.data, _id: undefined, _creationTime: undefined } }
                    });
            }

        }
    }

})
// export const joinTournamentByOneToOne = action({
//     args: { cid: v.number(), uid: v.string() },
//     handler: async (ctx, { cid, uid }) => {
//         console.log("pvp with cid:" + cid + ":" + uid)
//         const tournamentDef = tournamentDefs.find((t) => t.id === cid);


//             const tid = await ctx.runMutation(internal.tournaments.create, { cid, startTime: 0, endTime: 0 });

//             if (tid&&tournamentDef) {

//                 const battle = { tournamentId: tid, participants: tournamentDef.participants, column: COLUMN, row: ROW, goal: 1, chunk: 10 }
//                 const battleId = await ctx.runMutation(internal.battle.create, battle);
//                 const games = [];
//                 let gameInited = await ctx.runQuery(internal.gameService.findInitGame, { uid, trend: 1 })

//                 if (gameInited) {

//                     const gameId: string = await ctx.runMutation(internal.games.create, { game: { uid, battleId, tcid: cid + "", ...gameInited, gameId: undefined } });
//                     games.push({ uid, gameId });
//                     //get opponents
//                     const opponent = "1";
//                     const opponentGameId: string = await ctx.runMutation(internal.games.create, { game: { uid: opponent, battleId, tcid: cid + "", ...gameInited, gameId: undefined, ref: gameInited['gameId'] } });
//                     games.push({ uid: opponent, gameId: opponentGameId })

//                     await ctx.runMutation(internal.events.create, {
//                         name: "gameInited", gameId, data: { gameId, ...gameInited }
//                     });

//                     await ctx.runMutation(internal.bgames.create, {
//                         gameId: opponentGameId, ref: gameInited['gameId']
//                     });
//                     await ctx.runMutation(internal.events.create, {
//                         name: "battleCreated", uid, data: { games, id: battleId, ...battle }
//                     });
//                 }


//         }
//     }
// })
