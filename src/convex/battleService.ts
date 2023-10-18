import { v } from "convex/values";
import { tournamentDefs } from "../model/TournamentCfg";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";
export const findToSettle = action({
    args: {},
    handler: async (ctx) => {
        const toSettles: any[] = [];
        const battles: any[] = await ctx.runQuery(internal.battle.findToSettles)
        for (let battle of battles) {
            const tournament = await ctx.runQuery(internal.tournaments.find, { id: battle.tournamentId });
            if (tournament) {
                const tcfg = tournamentDefs.find((t) => t.id === tournament.cid)
            }
        }
        return toSettles;
    }
})

export const settle = action({
    args: { battleId: v.string() },
    handler: async (ctx, { battleId }) => {


    }
})
export const createBattle = action({
    args: { battleId: v.string() },
    handler: async (ctx, { battleId }) => {


    }
})
