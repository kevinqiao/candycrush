import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const find = query({
  args: { id: v.id("cuser") },
  handler: async (ctx, { id }) => {
    const user = await ctx.db.get(id);
    return { ...user, cuid: user?._id, _id: undefined };
  },
});
export const findByCid = query({
  args: { cid: v.string(), channel: v.number() },
  handler: async (ctx, { cid, channel }) => {
    const cuser = await ctx.db.query("cuser").filter((q) => q.and(q.eq(q.field("cid"), cid), q.eq(q.field("channel"), channel))).unique();
    return { ...cuser, _id: undefined }
  },
});
export const create = mutation({
  args: { cid: v.string(), name: v.optional(v.string()), email: v.optional(v.string()), phone: v.optional(v.string()), channel: v.number(), data: v.optional(v.any()) },
  handler: async (ctx, { cid, name, email, phone, channel, data }) => {
    const cuid = cid + "-" + channel;
    return await ctx.db.insert("cuser", { cid, cuid, name, channel, email, phone, data });
  },
});
export const update = mutation({
  args: { id: v.id("cuser"), data: v.any() },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { ...args.data });
  },
});