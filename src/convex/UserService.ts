import { v } from "convex/values";
import { COLUMN, ROW } from "../model/Constants";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";

export const authByToken = action({
    args: { uid: v.string(), token: v.string() },
    handler: async (ctx, { uid, token }) => {

        const user: any = await ctx.runQuery(internal.user.find, { id: uid as Id<"user"> })
        if (user) {
            const game = await ctx.runQuery(internal.games.findUserGame, { uid });
            if (game?.battleId && !game.status) {
                const b: any = await ctx.runQuery(internal.battle.find, { battleId: game.battleId as Id<"battle"> })
                if (!b.status) {
                    const games = await ctx.runQuery(internal.games.findBattleGames, { battleId: b.id })
                    if (games)
                        b['games'] = games.map((g) => ({ uid: g.uid, gameId: g._id, matched: g.matched }))
                    // const pasttime = Date.now() - b.createTime ?? Date.now();
                    user['battle'] = { ...b, column: COLUMN, row: ROW };
                }
            }
            // await ctx.runMutation(internal.user.update, { id: user["_id"], data: {} })
        }
        return { token: "123456", ...user, timestamp: Date.now() }
    }
})

export const findAllUser = action({
    args: {},
    handler: async (ctx, args) => {
        const users: any[] = await ctx.runQuery(internal.user.findAll);
        return users;
    }
})

export const logout = action({
    args: { uid: v.string() },
    handler: async (ctx, { uid }) => {

    }
})
export const signin = action({
    args: { uid: v.id("user"), token: v.string() },
    handler: async (ctx, { uid, token }) => {
        const user: any = await ctx.runQuery(internal.user.find, { id: uid });
        if (user) {
            const game = await ctx.runQuery(internal.games.findUserGame, { uid });
            if (game) {
                const b: any = await ctx.runQuery(internal.battle.find, { battleId: game.battleId as Id<"battle"> })
                if (b) {
                    const games = await ctx.runQuery(internal.games.findBattleGames, { battleId: b.id })
                    if (games)
                        b['games'] = games.map((g) => ({ uid: g.uid, gameId: g._id }))
                } else
                    b["games"] = [{ uid: uid, gameId: game._id }]
                user['battle'] = b;
            }
            await ctx.runMutation(internal.user.update, { id: user["_id"], data: {} })
        }
        return { token: "12345", ...user, timestamp: Date.now() }
    }
})
