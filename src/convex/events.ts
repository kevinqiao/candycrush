import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Grab the most recent messages.
    const events = await ctx.db.query("events").order("desc").collect();

    return events
  },
});
export const getGameInitEvent = internalQuery({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("events")
      .filter((q) => q.and(q.eq(q.field("gameId"), args.gameId), q.eq(q.field("name"), "gameInited")))
      .first();
    return event
  },
});
export const findGameInitEvent = query({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("events")
      .filter((q) => q.and(q.eq(q.field("gameId"), args.gameId), q.eq(q.field("name"), "gameInited")))
      .first();
    return event
  },
});
export const getByUser = query({
  args: { uid: v.string(), lastTime: v.number() },
  handler: async (ctx, { uid, lastTime }) => {
    if (uid === "###") return;
    let time = lastTime;
    if (time === 0) {
      const id = uid as Id<"user">
      const user = await ctx.db.get(id)
      // const user = await ctx.db.query(("user")).filter((q) => q.eq(q.field("uid"), uid)).first();
      if (user?.lastUpdate)
        time = user.lastUpdate
    }
    const event = await ctx.db
      .query("events").withIndex("by_uid", (q) => q.eq("uid", uid))
      .filter((q) => q.gt(q.field("_creationTime"), time)).order("desc")
      .first();
    if (event)
      return { ...event, _id: undefined, _creationTime: undefined, time: event._creationTime, id: event._id }
  },
});
export const getByGame = query({
  args: { gameId: v.optional(v.string()), laststep: v.number() },
  handler: async (ctx, args) => {
    if (args.laststep >= 0 && args.gameId) {
      const events = await ctx.db
        .query("events").withIndex("by_game", (q) => q.eq("gameId", args.gameId))
        .filter((q) => q.gt(q.field("steptime"), args.laststep)).order("desc")
        .collect();
      return events.map((event) => Object.assign({}, event, { id: event?._id, _creationTime: undefined, _id: undefined }))

    }
  },
});
export const findByBattle = query({
  args: { battleId: v.optional(v.string()) },
  handler: async (ctx, { battleId }) => {
    if (battleId) {
      const battle = await ctx.db.get(battleId as Id<"battle">);
      if (battle) {
        const event = await ctx.db
          .query("events").withIndex("by_battle", (q) => q.eq("battleId", battleId))
          .order("desc")
          .first();
        if (event)
          return Object.assign({}, event, { id: event?._id, _creationTime: undefined, _id: undefined })
      }
    }
  }
});
export const findByGame = query({
  args: { gameId: v.optional(v.string()), laststep: v.number() },
  handler: async (ctx, { gameId, laststep }) => {

    if (laststep >= 0 && gameId) {
      const game = await ctx.db.get(gameId as Id<"games">);
      if (game) {
        const from = laststep;
        const to = game.laststep ?? 0;

        const events = await ctx.db
          .query("events").withIndex("by_game", (q) => q.eq("gameId", game?.ref ?? gameId))
          .filter((q) => q.and(q.gt(q.field("steptime"), from), q.lte(q.field("steptime"), to))).order("asc")
          .collect();
        return events.map((event) => Object.assign({}, event, { id: event?._id, _creationTime: undefined, _id: undefined }))
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
export const findStepEvents = query({
  args: { gameId: v.string(), start: v.number(), end: v.number() },
  handler: async (ctx, { gameId, start, end }) => {
    // console.log(start + ":" + end)
    const events = await ctx.db
      .query("events")
      .filter((q) => q.and(q.eq(q.field("gameId"), gameId), q.gt(q.field("steptime"), start), q.lte(q.field("steptime"), end))).order("asc")
      .collect();

    return events
  },
});
export const getStepEvents = internalQuery({
  args: { gameId: v.string(), start: v.number(), end: v.number() },
  handler: async (ctx, { gameId, start, end }) => {
    const events = await ctx.db
      .query("events")
      .filter((q) => q.and(q.eq(q.field("gameId"), gameId), q.gt(q.field("steptime"), start), q.lte(q.field("steptime"), end))).order("asc")
      .collect();
    return events
  },
});
export const findGameEvents = internalQuery({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("gameId"), args.gameId)).order("asc").collect();
    return events
  },
});
export const create = internalMutation({
  args: { name: v.string(), uid: v.optional(v.string()), steptime: v.optional(v.number()), battleId: v.optional(v.string()), gameId: v.optional(v.string()), data: v.any() },
  handler: async (ctx, { name, uid, battleId, gameId, steptime, data }) => {
    await ctx.db.insert("events", { name, uid, battleId, gameId, steptime, data });
    return
  },
});
export const screate = mutation({
  args: { name: v.string(), uid: v.optional(v.string()), steptime: v.optional(v.number()), gameId: v.optional(v.string()), data: v.any() },
  handler: async (ctx, { name, uid, gameId, steptime, data }) => {
    await ctx.db.insert("events", { name, uid, gameId, steptime, data });
    return
  },
});
export const hi = internalMutation(
  async (ctx) => {
    await ctx.db.insert("events", { name: "test", uid: "kevin", data: {} });
  }
);

