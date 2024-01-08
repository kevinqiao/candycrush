import { v } from "convex/values";
import { COLUMN, ROW } from "../model/Constants";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";
export const findUser = action({
    args: { uid: v.string() },
    handler: async (ctx, args) => {

    }
})
export const telegramAuthValidate = action({
    args: { str: v.string() },
    handler: async (ctx, { str }) => {

    }
})

export const authByToken = action({
    args: { uid: v.string(), token: v.string() },
    handler: async (ctx, { uid, token }) => {
        const user: any = await ctx.runQuery(internal.user.findByUID, { uid })
        if (user) {
            const game = await ctx.runQuery(internal.games.findUserGame, { uid });
            if (game && !game.status) {
                const b: any = await ctx.runQuery(internal.battle.find, { battleId: game.battleId as Id<"battle"> })
                if (!b.status) {
                    const games = await ctx.runQuery(internal.games.findBattleGames, { battleId: b.id })
                    if (games)
                        b['games'] = games.map((g) => ({ uid: g.uid, gameId: g._id, matched: g.matched }))
                    // const pasttime = Date.now() - b.createTime ?? Date.now();
                    user['battle'] = { ...b, column: COLUMN, row: ROW };
                }
            }
            await ctx.runMutation(internal.user.update, { id: user["_id"], data: {} })
        }
        return { ...user, timestamp: Date.now() }
    }
})

export const findAllUser = action({
    args: {},
    handler: async (ctx, args) => {
        const users: any[] = await ctx.runQuery(internal.user.findAll);
        return users;
    }
})
export const login = action({
    args: { uname: v.string(), password: v.string() },
    handler: async (ctx, args) => {

    }
})
export const logout = action({
    args: { uid: v.string() },
    handler: async (ctx, { uid }) => {

    }
})
export const signin = action({
    args: { uid: v.string(), token: v.string() },
    handler: async (ctx, { uid, token }) => {
        const user: any = await ctx.runQuery(internal.user.findByUID, { uid });
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
        return user;
    }
})
export const signup = action({
    args: { uname: v.string(), password: v.string() },
    handler: async (ctx, { uname, password }) => {

    }
})