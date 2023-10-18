import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";

export const create = internalMutation({
  args: { tournamentId: v.id("tournament"), type: v.number(), status: v.number() },
  handler: async (ctx, { tournamentId, type, status }) => {
    return await ctx.db.insert("battle", { tournamentId, type, status });
  },
});

export const find = internalQuery({
  args: { battleId: v.id("battle") },
  handler: async (ctx, { battleId }) => {
    const battle = await ctx.db.get(battleId);
    if (battle)
      return Object.assign({}, battle, { id: battle._id, _id: undefined, createTime: battle._creationTime, _creationTime: undefined });
    return null;
  },
});
export const findToSettles = internalQuery({
  handler: async (ctx) => {
    const battles = await ctx.db.query("battle").filter((q) => q.lt(q.field("stoptime"), Date.now() - 300)).order("asc").collect();
    return battles;
  },
});
export const allBattles = internalQuery({
  args: { uid: v.string() },
  handler: async (ctx, { uid }) => {
    const battles = await ctx.db
      .query("battle").collect();
    return battles

  },
});
export const findMyBattles = query({
  args: { uid: v.string() },
  handler: async (ctx, { uid }) => {
    const battles = await ctx.db
      .query("battle").order("desc").take(20);
    const mybattles = [];
    for (let battle of battles) {
      const games = await ctx.db.query("games").filter((q) => q.eq(q.field("battleId"), battle._id)).order("asc").collect();
      mybattles.push(Object.assign({}, battle, { id: battle._id, createTime: battle._creationTime, _id: undefined, _creationTime: undefined, games: games.map((g) => ({ uid: g.uid, gameId: g._id })) }))
    }
    return mybattles
    // return battles.map((b) => Object.assign({}, b, { id: b._id, createTime: b._creationTime, _id: undefined, _creationTime: undefined }))
  },
});