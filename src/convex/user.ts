import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
export const findAll = internalQuery({
  handler: async (ctx) => {
    const users = await ctx.db.query("user").order("desc").collect();
    return users
  },
});
export const findByUID = internalQuery({
  args: { uid: v.string() },
  handler: async (ctx, { uid }) => {
    const user = await ctx.db.query("user").filter((q) => q.eq(q.field("uid"), uid)).unique();
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
export const findByUid = query({
  args: { uid: v.string() },
  handler: async (ctx, { uid }) => {
    const user = await ctx.db.query("user").filter((q) => q.eq(q.field("uid"), uid)).unique();
    if (user)
      return { ...user, id: user?._id, _id: undefined }
  },
});

export const create = mutation({
  args: { name: v.string(), token: v.optional(v.string()), email: v.optional(v.string()) },
  handler: async (ctx, { name, email }) => {
    const docId = await ctx.db.insert("user", { name, email, status: 0 });
    if (docId)
      await ctx.db.patch(docId, { uid: docId })
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
