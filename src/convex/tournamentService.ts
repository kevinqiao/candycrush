import { v } from "convex/values";
import { BATTLE_TYPE } from "../model/Constants";
import { tournamentDefs } from "../model/TournamentCfg";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";

const COLUMN = 7;
const ROW = 8;
export const joinTournament = action({
    args: { tournamentId: v.id("tournament"), cid: v.number(), uid: v.string() },
    handler: async (ctx, args) => {
        // console.log("join tournament");
        // let battle_type = BATTLE_TYPE.SOLO;
        // if (args.cid > 0) {
        //     const tdef = tournamentDefs.find((t) => t.id === args.cid);
        //     if (tdef)
        //         battle_type = tdef.battleType;
        // }
        // const { cells } = gameEngine.initGame(ROW, COLUMN);

        // const gameId: string = await ctx.runMutation(internal.games.create, { game: { uid: args.uid, cells, lastCellId: cells.length + 1 } });
        // const battle = { tournamentId: args.tournamentId, goal: 1, column: COLUMN, row: ROW };
        // const battleId = await ctx.runMutation(internal.battle.create, battle);
        // await ctx.runMutation(internal.events.create, {
        //     name: "battleCreated", uid: "kqiao", data: { id: battleId, games: [gameId], tournamentId: args.tournamentId, type: battle_type, column: COLUMN, row: ROW }
        // });
        // await ctx.runMutation(internal.events.create, {
        //     name: "gameInited", uid: "kqiao", gameId, data: { gameId, cells }
        // });

    }
})
export const joinTournamentByGroup = action({
    args: { cid: v.number(), uid: v.string() },
    handler: async (ctx, { cid, uid }) => {
        console.log("join tournament")
        const tournamentDef = tournamentDefs.find((t) => t.id === cid);
        if (tournamentDef?.battleType === BATTLE_TYPE.SOLO) {
            const tcid: string = tournamentDef.id + ""
            const tid = await ctx.runMutation(internal.tournaments.create, { cid, startTime: 0, endTime: 0 });

            if (tid) {

                const battle = { tournamentId: tid, participants: tournamentDef.participants, column: COLUMN, row: ROW, goal: 1, chunk: 10 };
                const battleId = await ctx.runMutation(internal.battle.create, battle);
                const games = [];
                let gameInited = tournamentDef.participants === 2 ? await ctx.runMutation(internal.gameService.createInitGame, { uid }) : await ctx.runQuery(internal.gameService.findInitGame, { uid, trend: 1 });
                // let gameInited = await ctx.runQuery(internal.games.getInitGame, { gameId: "31wn8c5rrq08175n9x5ka9hb9kw8ej8" });
                if (gameInited) {
                    const game = { uid, battleId, tcid, ...gameInited, ref: gameInited.gameId, _id: undefined, _creationTime: undefined, gameId: undefined, chunk: battle.chunk, goal: battle.goal, type: 0 }
                    // console.log("ref:" + game.ref)
                    const gameId: string = await ctx.runMutation(internal.games.create, { game });
                    games.push({ uid, gameId });
                    if (!game.ref)
                        await ctx.runMutation(internal.events.create, {
                            name: "gameInited", gameId, data: { gameId, ...gameInited, type: 0 }
                        });
                    // else {
                    //     await ctx.runMutation(internal.bgames.create, { gameId, ref: game.ref })
                    // }
                    for (let i = 1; i < tournamentDef.participants; i++) {
                        const opponent = i + ""
                        const gameId: string = await ctx.runMutation(internal.games.create, { game: { ...game, uid: opponent, _id: undefined, type: 0 }, });
                        games.push({ uid: opponent, gameId });
                    }
                    await ctx.runMutation(internal.events.create, {
                        name: "battleCreated", uid, data: { games, id: battleId, ...battle, column: COLUMN, row: ROW, pasttime: 0 }
                    });

                }

            }
        }
    }
})
export const joinTournamentByOneToOne = action({
    args: { cid: v.number(), uid: v.string() },
    handler: async (ctx, { cid, uid }) => {
        console.log("pvp with cid:" + cid + ":" + uid)
        const tournamentDef = tournamentDefs.find((t) => t.id === cid);
        if (tournamentDef?.battleType === BATTLE_TYPE.SYNC) {

            const tid = await ctx.runMutation(internal.tournaments.create, { cid, startTime: 0, endTime: 0 });

            if (tid) {

                const battle = { tournamentId: tid, participants: tournamentDef.participants, column: COLUMN, row: ROW, goal: 1, chunk: 10 }
                const battleId = await ctx.runMutation(internal.battle.create, battle);
                const games = [];
                let gameInited = await ctx.runQuery(internal.gameService.findInitGame, { uid, trend: 1 })

                if (gameInited) {

                    const gameId: string = await ctx.runMutation(internal.games.create, { game: { uid, battleId, tcid: cid + "", ...gameInited, gameId: undefined } });
                    games.push({ uid, gameId });
                    //get opponents
                    const opponent = "1";
                    const opponentGameId: string = await ctx.runMutation(internal.games.create, { game: { uid: opponent, battleId, tcid: cid + "", ...gameInited, gameId: undefined, ref: gameInited['gameId'] } });
                    games.push({ uid: opponent, gameId: opponentGameId })

                    await ctx.runMutation(internal.events.create, {
                        name: "gameInited", gameId, data: { gameId, ...gameInited }
                    });

                    await ctx.runMutation(internal.bgames.create, {
                        gameId: opponentGameId, ref: gameInited['gameId']
                    });
                    await ctx.runMutation(internal.events.create, {
                        name: "battleCreated", uid, data: { games, id: battleId, ...battle }
                    });
                }

            }
        }
    }
})
export const findMyTournaments = action({
    args: { uid: v.string() },
    handler: async (ctx, args) => {
        return tournamentDefs
    }
})
export const findMyBattles = action({
    args: { uid: v.string() },
    handler: async (ctx, { uid }) => {

        const battles: any = await ctx.runQuery(internal.battle.allBattles, { uid })
        return battles
    }
})