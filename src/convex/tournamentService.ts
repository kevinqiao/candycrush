import { v } from "convex/values";
import { BATTLE_TYPE } from "../model/Constants";
import { tournamentDefs } from "../model/TournamentCfg";
import * as gameEngine from "../service/GameEngine";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";
export const joinTournament = action({
    args: { tournamentId: v.id("tournament"), cid: v.number(), uid: v.string() },
    handler: async (ctx, args) => {
        console.log("join tournament");
        let battle_type = BATTLE_TYPE.SOLO;
        if (args.cid > 0) {
            const tdef = tournamentDefs.find((t) => t.id === args.cid);
            if (tdef)
                battle_type = tdef.battleType;
        }
        const { cells } = gameEngine.initGame();

        const gameId: string = await ctx.runMutation(internal.games.create, { game: { uid: args.uid, cells, lastCellId: cells.length + 1 } });
        const battle = { tournamentId: args.tournamentId, games: [gameId], type: BATTLE_TYPE.SOLO, status: 0 };
        const battleId = await ctx.runMutation(internal.battle.create, battle);
        await ctx.runMutation(internal.events.create, {
            name: "battleCreated", uid: "kqiao", data: { id: battleId, games: [gameId], tournamentId: args.tournamentId, type: battle_type }
        });
        await ctx.runMutation(internal.events.create, {
            name: "gameInited", uid: "kqiao", gameId, data: { gameId, cells }
        });

    }
})
export const joinTournamentByGroup = action({
    args: { cid: v.number(), uid: v.string() },
    handler: async (ctx, { cid, uid }) => {

        const tournamentDef = tournamentDefs.find((t) => t.id === cid);
        if (tournamentDef?.battleType === BATTLE_TYPE.SOLO) {
            const tcid: string = tournamentDef.id + ""
            const tid = await ctx.runMutation(internal.tournaments.create, { cid, startTime: 0, endTime: 0 });

            if (tid) {
                const battle = { tournamentId: tid, type: tournamentDef.battleType, status: 0 };
                const battleId = await ctx.runMutation(internal.battle.create, battle);
                const games = [];
                let gameInited = tournamentDef.participants === 1 ? await ctx.runMutation(internal.gameService.createInitGame, { uid }) : await ctx.runQuery(internal.gameService.findInitGame, { uid, trend: 1 });

                if (gameInited) {
                    const gameId: string = await ctx.runMutation(internal.games.create, { game: { uid, battleId, tcid, ...gameInited, _id: undefined, _creationTime: undefined, gameId: undefined } });
                    games.push({ uid, gameId });
                    await ctx.runMutation(internal.events.create, {
                        name: "gameInited", gameId, data: { gameId, ...gameInited }
                    });
                    for (let i = 1; i < tournamentDef.participants; i++) {
                        const opponent = i + ""
                        const gameId: string = await ctx.runMutation(internal.games.create, { game: { uid: opponent, seed: gameInited.seed, tcid, battleId, ref: gameInited['_id'] } });
                        games.push({ uid: opponent, gameId });
                    }
                    await ctx.runMutation(internal.events.create, {
                        name: "battleCreated", uid, data: { games, id: battleId, ...battle }
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

                const battle = { tournamentId: tid, type: tournamentDef.battleType, status: 0 };
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