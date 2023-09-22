import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Grab the most recent messages.
    const events = await ctx.db.query("events").order("desc").first();

    return events
  },
});
export const getByUser = query({
  args: { uid: v.string() },
  handler: async (ctx, args) => {
    // Grab the most recent messages.
    // const events = await ctx.db.query("events").order("desc").first();
    const events = await ctx.db
      .query("events")
      .filter((q) => q.and(q.eq(q.field("uid"), args.uid), q.gte(q.field("_creationTime"), Date.now() - 2000))).order("desc")
      .first();

    return events
  },
});
export const getByGame = query({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    if (args.gameId !== "0000") {
      const events = await ctx.db
        .query("events")
        .filter((q) => q.and(q.eq(q.field("gameId"), args.gameId), q.neq(q.field("name"), "gameInited"))).order("desc")
        .first();
      return events
    }
  },
});
export const findAllByGame = query({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    if (args.gameId !== "0000") {
      const events = await ctx.db
        .query("events")
        .filter((q) => q.eq(q.field("gameId"), args.gameId)).order("asc").collect();
      const elist = events.map((e) => {
        return { name: e.name, data: e.data, steptime: e.steptime }
      })
      return elist
    }
  },
});
export const create = internalMutation({
  args: { name: v.string(), uid: v.optional(v.string()), steptime: v.optional(v.number()), gameId: v.optional(v.string()), data: v.any() },
  handler: async (ctx, { name, uid, gameId, steptime, data }) => {
    await ctx.db.insert("events", { name, uid, gameId, steptime, data });
    return
  },
});

