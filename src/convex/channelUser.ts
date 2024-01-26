import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const find = query({
  args: { id: v.id("channelUser") },
  handler: async (ctx, { id }) => {
    const user = await ctx.db.get(id);
    return user;
  },
});
export const findByCid = query({
  args: { cid: v.string(), channel: v.number() },
  handler: async (ctx, { cid, channel }) => {
    const cuser = await ctx.db.query("channelUser").filter((q) => q.and(q.eq(q.field("cid"), cid), q.eq(q.field("channel"), channel))).unique();
    return { ...cuser, id: cuser?._id, _id: undefined }
  },
});
export const create = mutation({
  args: { cid: v.string(), uid: v.optional(v.string()), name: v.optional(v.string()), email: v.optional(v.string()), phone: v.optional(v.string()), channel: v.number(), data: v.optional(v.any()) },
  handler: async (ctx, { cid, uid, name, email, phone, channel, data }) => {
    await ctx.db.insert("channelUser", { cid, uid, name, channel, email, phone, data });
  },
});
export const update = mutation({
  args: { id: v.id("channelUser"), data: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { ...args.data });
  },
});