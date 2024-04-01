import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";
export const join = action({
    args: { tid: v.string(), uid: v.string() },
    handler: async (ctx, { tid, uid }) => {
        //check if user already in the battle
        const game = await ctx.runQuery(internal.games.findUserGame, { uid });
        console.log("status:" + game?.status)
        if (game && !game.status) {
            if (!game.dueTime || Date.now() < game.dueTime)
                return { ok: false, code: 1 }
        }
        //find the tournament  for the cost requirement
        //charge the cost of attend
        const qs = await ctx.runQuery(internal.matchqueue.finByUid, { uid });
        if (qs)
            return { ok: false, code: 2 }

        await ctx.runMutation(internal.matchqueue.create, { uid, tournamentId: tid });
        return { ok: true }

    }
})

