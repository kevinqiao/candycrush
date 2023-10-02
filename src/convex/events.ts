import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
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
    if (args.uid === "###") return;
    const events = await ctx.db
      .query("events")
      .filter((q) => q.and(q.eq(q.field("uid"), args.uid), q.gte(q.field("_creationTime"), Date.now() - 2000))).order("desc")
      .first();

    return events
  },
});
export const getByGame = query({
  args: { gameId: v.optional(v.string()), battleId: v.optional(v.string()), replay: v.optional(v.boolean()) },
  handler: async (ctx, args) => {

    if (!args.replay && args.gameId && args.battleId) {

      const bid = args.battleId as Id<"battle">
      const battle = await ctx.db.get(bid);
      if (battle) {

        const event = await ctx.db
          .query("events")
          .filter((q) => q.and(q.eq(q.field("gameId"), args.gameId), q.neq(q.field("name"), "gameInited"))).order("desc")
          .first();

        return Object.assign({}, event, { id: event?._id, _creationTime: undefined, _id: undefined })
      }
    }
  },
});
export const findAllByGame = query({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {

    if (args.gameId !== "0000") {
      const events = await ctx.db
        .query("events")
        .filter((q) => q.and(q.eq(q.field("gameId"), args.gameId), q.neq(q.field("name"), "gameInited"))).order("asc").collect();
      const elist = events.map((e) => {
        return { id: e._id, name: e.name, data: e.data, steptime: e.steptime ?? 0 }
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
export const hi = internalMutation(
  async (ctx) => {
    console.log("how are you")
    await ctx.db.insert("events", { name: "test", uid: "kevin", data: {} });
  }
);

