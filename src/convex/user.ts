import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
export const findAll = internalQuery({
  handler: async (ctx) => {
    const users = await ctx.db.query("user").order("desc").collect();
    return users
  },
});

export const find = internalQuery({
  args: { id: v.id("user") },
  handler: async (ctx, { id }) => {
    const user = await ctx.db.get(id);
    return { ...user, uid: user?._id, _id: undefined };
  },
});
export const findByUid = query({
  args: { id: v.id("user") },
  handler: async (ctx, { id }) => {
    const user = await ctx.db.get(id);
    return user;
  },
});
export const findByCuid = query({
  args: { cuid: v.string(), tenant: v.string() },
  handler: async (ctx, { cuid, tenant }) => {
    const user = await ctx.db.query("user").filter((q) => q.and(q.eq(q.field("cuid"), cuid), q.eq(q.field("tenant"), tenant))).unique();
    return { ...user, uid: user?._id, _id: undefined };
  },
});
export const create = mutation({
  args: { cuid: v.string(), name: v.string(), tenant: v.optional(v.string()), token: v.optional(v.string()), email: v.optional(v.string()) },
  handler: async (ctx, { cuid, name, tenant, token, email }) => {
    const docId = await ctx.db.insert("user", { cuid, name, email, token, tenant });
    return docId
  },
});
export const update = internalMutation({
  args: { id: v.id("user"), data: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { ...args.data, lastUpdate: Date.now() });
  },
});
export const updateToken = mutation({
  args: { id: v.id("user"), token: v.string() },
  handler: async (ctx, { id, token }) => {
    await ctx.db.patch(id, { token });
  },
});
