import { v } from "convex/values";
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
export const signup = action({
    args: { uname: v.string(), password: v.string() },
    handler: async (ctx, { uname, password }) => {

    }
})