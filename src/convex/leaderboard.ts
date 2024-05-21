import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const findRanks = internalQuery({
  args: { tournamentId: v.string(), numbers: v.number(), startTime: v.number() },
  handler: async (ctx, { tournamentId, numbers }) => {
    const ranks = await ctx.db.query("leaderboard")
      .filter((q) => q.eq(q.field("tournamentId"), tournamentId)).withIndex("by_score").order("desc")
      .take(numbers);
    if (ranks)
      return ranks.map((r) => Object.assign({}, r, { _id: undefined, _creationTime: undefined }))
    return null;
  },
});

export const find = internalQuery({
  args: { uid: v.string(), tournamentId: v.string() },
  handler: async (ctx, args) => {
    let board = null;
    const boardItem = await ctx.db.query("leaderboard")
      .filter((q) => q.and(q.eq(q.field("uid"), args.uid), q.eq(q.field("tournamentId"), args.tournamentId)))
      .first();
    if (boardItem) {
      const ranks = await ctx.db.query("leaderboard")
        .filter((q) => q.and(q.gte(q.field("score"), boardItem.score), q.eq(q.field("tournamentId"), args.tournamentId))).collect();
      const rank: number = ranks.length;
      board = Object.assign({}, boardItem, { _id: undefined, _creationTime: undefined, id: boardItem['_id'], rank })
    }
    return board
  },
});

export const update = internalMutation({
  args: { boardId: v.id("leaderboard"), score: v.number() },
  handler: async (ctx, { boardId, score }) => {
    await ctx.db.patch(boardId, { score });
  },
});

