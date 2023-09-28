import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";

export const create = internalMutation({
  args: { tournamentId: v.id("tournament"), type: v.number(), games: v.any(), status: v.number() },
  handler: async (ctx, { tournamentId, type, games, status }) => {
    return await ctx.db.insert("battle", { tournamentId, type, games, status });
  },
});

export const find = internalQuery({
  args: { battleId: v.id("battle") },
  handler: async (ctx, { battleId }) => {
    const battle = await ctx.db.get(battleId);
    if (battle)
      return Object.assign({}, battle, { id: battle._id, _id: undefined, createTime: battle._creationTime, _creationTime: undefined });
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
      .query("battle").order("desc").collect();
    return battles.map((b) => Object.assign({}, b, { id: b._id, createTime: b._creationTime, _id: undefined, _creationTime: undefined }))
  },
});