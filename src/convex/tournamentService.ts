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
        const cells = gameEngine.initGame();

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
export const joinTournamentByType = action({
    args: { cid: v.number(), uid: v.string() },
    handler: async (ctx, { cid, uid }) => {
        // console.log("join tournament by type:" + cid)
        const tid = await ctx.runMutation(internal.tournaments.create, { cid, startTime: 0, endTime: 0 });

        if (tid) {

            let battle_type = BATTLE_TYPE.SOLO;
            if (cid > 0) {
                const tdef = tournamentDefs.find((t) => t.id === cid);
                if (tdef)
                    battle_type = tdef.battleType;
            }
            console.log("tournamentId:" + tid + " type:" + battle_type)
            const cells = gameEngine.initGame();

            const gameId: string = await ctx.runMutation(internal.games.create, { game: { uid: uid, cells, lastCellId: cells.length + 1 } });

            const battle = { tournamentId: tid, games: [gameId], type: BATTLE_TYPE.SOLO, status: 0 };
            const battleId = await ctx.runMutation(internal.battle.create, battle);

            await ctx.runMutation(internal.events.create, {
                name: "battleCreated", uid: "kqiao", data: { id: battleId, games: [gameId], tournamentId: tid, type: battle_type }
            });
            await ctx.runMutation(internal.events.create, {
                name: "gameInited", uid: "kqiao", gameId, data: { gameId, cells }
            });

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