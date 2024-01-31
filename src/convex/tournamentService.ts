import { v } from "convex/values";

import { internal } from "./_generated/api";
import { action } from "./_generated/server";

const COLUMN = 7;
const ROW = 8;

export const joinTournamentByGroup = action({
    args: { tid: v.string(), uid: v.string() },
    handler: async (ctx, { tid, uid }) => {


        const tournament = await ctx.runQuery(internal.tournaments.findById, { id: tid });

        if (tournament) {
            const battle = { tournamentId: tid, participants: tournament.participants, column: COLUMN, row: ROW, goal: 1, chunk: 10, searchDueTime: Date.now() + 2500, startTime: Date.now() + 15000 };
            const battleId = await ctx.runMutation(internal.battle.create, battle);
            const games = [];
            const gameInited = tournament.participants === 2 ? await ctx.runMutation(internal.gameService.createInitGame, { uid }) : await ctx.runQuery(internal.gameService.findInitGame, { uid, trend: 1 });
            // let gameInited = await ctx.runQuery(internal.games.getInitGame, { gameId: "31wn8c5rrq08175n9x5ka9hb9kw8ej8" });
            if (gameInited) {
                const game = { uid, battleId, tid, ...gameInited, ref: gameInited.gameId, _id: undefined, _creationTime: undefined, gameId: undefined, chunk: battle.chunk, goal: battle.goal, type: 0 }
                // console.log("ref:" + game.ref)
                let gameId: string = await ctx.runMutation(internal.games.create, { game });
                games.push({ uid, gameId });
                if (!game.ref)
                    await ctx.runMutation(internal.events.create, {
                        name: "gameInited", gameId, data: { gameId, ...gameInited, type: 0 }
                    });

                const opponent = uid === "1" ? "3" : "1"
                gameId = await ctx.runMutation(internal.games.create, { game: { ...game, uid: opponent, _id: undefined, type: 0 }, });
                if (gameId)
                    await ctx.runMutation(internal.events.create, {
                        name: "gameInited", gameId, data: { gameId, ...gameInited, type: 0 }
                    });
                games.push({ uid: opponent, gameId });

                // for (let i = 1; i < tournament.participants; i++) {
                //     const opponent = i + ""
                //     const gameId: string = await ctx.runMutation(internal.games.create, { game: { ...game, uid: opponent, _id: undefined, type: 0 }, });
                //     games.push({ uid: opponent, gameId });
                // }
                for (const game of games)
                    await ctx.runMutation(internal.events.create, {
                        name: "battleCreated", uid: game.uid, data: { games, id: battleId, ...battle, column: COLUMN, row: ROW, pasttime: 0 }
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

export const findMyBattles = action({
    args: { uid: v.string() },
    handler: async (ctx, { uid }) => {

    }
})