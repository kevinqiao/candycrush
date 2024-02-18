import { v } from "convex/values";
import { internalQuery, query } from "./_generated/server";
export const findById = internalQuery({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    // Grab the most recent messages.
    const tournament = await ctx.db.query("tournament").filter((q) => q.eq(q.field("id"), id)).order("asc").first();
    return tournament
  },
});
export const findAll = query({
  handler: async (ctx) => {
    const tournaments = await ctx.db.query("tournament").collect();
    return tournaments
  },
});



