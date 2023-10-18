import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
export const findAll = internalQuery({
  handler: async (ctx) => {
    const users = ctx.db.query("user").order("desc").collect();
    return users
  },
});
export const findByUID = internalQuery({
  args: { uid: v.string() },
  handler: async (ctx, { uid }) => {
    const user = ctx.db.query("user").filter((q) => q.eq(q.field("uid"), uid)).first();
    return user
  },
});
export const find = internalQuery({
  args: { id: v.id("user") },
  handler: async (ctx, { id }) => {
    const user = await ctx.db.get(id);
    return user;
  },
});

export const create = internalMutation({
  args: { uid: v.string(), name: v.string(), email: v.optional(v.string()), channel: v.number() },
  handler: async (ctx, { uid, name, email, channel }) => {
    await ctx.db.insert("user", { uid, name, channel, email, status: 0 });
  },
});
export const update = internalMutation({
  args: { id: v.id("user"), data: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { ...args.data, lastUpdate: Date.now() });
  },
});