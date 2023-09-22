import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
export const list = internalMutation({
  args: { id: v.id("tournament") },
  handler: async (ctx, { id }) => {
    // Grab the most recent messages.
    const tournament = await ctx.db.get(id)
    return tournament
  },
});

export const create = internalMutation({
  args: { name: v.string(), uid: v.optional(v.string()), steptime: v.optional(v.number()), gameId: v.optional(v.string()), data: v.any() },
  handler: async (ctx, { name, uid, gameId, steptime, data }) => {
    await ctx.db.insert("events", { name, uid, gameId, steptime, data });
    return
  },
});

