import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internalMutation, internalQuery } from "./_generated/server";
import { sessionQuery } from "./custom/session";

// export const findRanks = internalQuery({
//   args: { tournamentId: v.string(), numbers: v.number(), startTime: v.number() },
//   handler: async (ctx, { tournamentId, numbers }) => {
//     const ranks = await ctx.db.query("leaderboard")
//       .filter((q) => q.eq(q.field("tournamentId"), tournamentId)).withIndex("by_score").order("desc")
//       .take(numbers);
//     if (ranks)
//       return ranks.map((r) => Object.assign({}, r, { _id: undefined, _creationTime: undefined }))
//     return null;
//   },
// });

export const find = internalQuery({
  args: { id: v.id("leaderboard") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  },
});

// export const find = internalQuery({
//   args: { uid: v.string(), tournamentId: v.string() },
//   handler: async (ctx, args) => {
//     let board = null;
//     const boardItem = await ctx.db.query("leaderboard")
//       .filter((q) => q.and(q.eq(q.field("uid"), args.uid), q.eq(q.field("tournamentId"), args.tournamentId)))
//       .first();
//     if (boardItem) {
//       const ranks = await ctx.db.query("leaderboard")
//         .filter((q) => q.and(q.gte(q.field("score"), boardItem.score), q.eq(q.field("tournamentId"), args.tournamentId))).collect();
//       const rank: number = ranks.length;
//       board = Object.assign({}, boardItem, { _id: undefined, _creationTime: undefined, id: boardItem['_id'], rank })
//     }
//     return board
//   },
// });

export const update = internalMutation({
  args: { boardId: v.id("leaderboard"), score: v.number() },
  handler: async (ctx, { boardId, score }) => {
    await ctx.db.patch(boardId, { score });
  },
});

export const findByTournament = sessionQuery({
  args: { tournamentId: v.string(), term: v.optional(v.number()) },
  handler: async (ctx, { tournamentId, term }) => {
    console.log("tournamentId:" + tournamentId + " term:" + term)
    // const tournament = await ctx.db.get(tournamentId as Id<"tournament">)
    const tournament = await ctx.db.query("tournament").filter((q) => q.eq(q.field("id"), tournamentId)).first();
    if (!ctx.user || !tournament) return;
    const result: any = { leaders: [], rank: -1 };
    const uid = ctx.user.uid;
    const boardItem = await ctx.db
      .query("leaderboard").withIndex("by_tournament_term_uid", (q) => q.eq("tournamentId", tournament.id).eq("term", term ?? tournament.currentTerm).eq("uid", uid)).unique();
    if (boardItem) {
      const ranks = await ctx.db
        .query("leaderboard").withIndex("by_tournament_term_score", (q) => q.eq("tournamentId", tournament.id).eq("term", term ?? tournament.currentTerm).gte("score", boardItem.score)).order("desc").collect();
      result['rank'] = ranks.length;
    }

    const leaders = await ctx.db
      .query("leaderboard").withIndex("by_tournament_term_score", (q) => q.eq("tournamentId", tournament.id).eq("term", term ?? tournament.currentTerm)).order("desc").take(20);
    let rank = 0;
    for (const leader of leaders) {
      const player = await ctx.db.get(leader.uid as Id<"user">);
      if (player) {
        result['leaders'].push({ player: { name: player.name, uid: leader.uid, avatar: player.avatar }, rank: ++rank, score: leader.score })
      }
    }
    return result
  },
});


export const collect = internalMutation({
  args: { uid: v.string(), leaderboardId: v.id("leaderboard") },
  handler: async (ctx, { uid, leaderboardId }) => {
    const leaderboard = await ctx.db.get(leaderboardId);
    if (leaderboard && leaderboard.uid === uid && !leaderboard.collected) {
      await ctx.db.patch(leaderboardId, { collected: 1 })
    }
  },
})
