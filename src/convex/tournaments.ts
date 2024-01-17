import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { tournaments } from "./data/TournamentData";
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
export const create = internalMutation({
  args: { cid: v.number(), startTime: v.number(), endTime: v.number() },
  handler: async (ctx, { cid, startTime, endTime }) => {

  },
});
export const load = mutation({
  handler: async (ctx) => {
    for (const t of tournaments) {
      const assetId = await ctx.db.insert("tournament", { ...t });
    }
  },
});

