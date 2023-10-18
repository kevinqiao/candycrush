import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
export const find = internalQuery({
  args: { id: v.id("tournament") },
  handler: async (ctx, { id }) => {
    // Grab the most recent messages.
    const tournament = await ctx.db.get(id)
    return tournament
  },
});
export const list = internalMutation({
  args: { id: v.id("tournament") },
  handler: async (ctx, { id }) => {
    // Grab the most recent messages.
    const tournament = await ctx.db.get(id)
    return tournament
  },
});
export const create = internalMutation({
  args: { cid: v.number(), startTime: v.number(), endTime: v.number() },
  handler: async (ctx, { cid, startTime, endTime }) => {
    const tid = await ctx.db.insert("tournament", { cid, startTime, endTime, status: 0 });
    return tid
  },
});

