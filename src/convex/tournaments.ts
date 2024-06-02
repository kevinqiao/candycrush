import { v } from "convex/values";
import { getMonthDate, getWeekDate } from "../util/Utils";
import { Id } from "./_generated/dataModel";
import { internalMutation, internalQuery } from "./_generated/server";
import { sessionMutation, sessionQuery } from "./custom/session";
export const findById = internalQuery({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    // Grab the most recent messages.
    const tournament = await ctx.db.query("tournament").filter((q) => q.eq(q.field("id"), id)).order("asc").first();
    return tournament
  },
});


export const findAll = sessionQuery({
  args: {},
  handler: async (ctx) => {
    const tournaments = await ctx.db.query("tournament").filter((q) => q.eq(q.field("status"), 0)).collect();
    const tlist = tournaments.map((t) => ({ ...t, _id: undefined }));
    return tlist
  },
});

export const claim = sessionMutation({
  args: { battleId: v.optional(v.string()), leaderboardId: v.optional(v.string()) },
  handler: async (ctx, { battleId, leaderboardId }): Promise<any> => {
    if (ctx.user) {
      const { uid } = ctx.user;
      if (leaderboardId) {
        const leaderboard = await ctx.db.get(leaderboardId as Id<"leaderboard">);
        if (leaderboard?.uid === uid && !leaderboard.collected) {
          leaderboard.collected = 1;
          await ctx.db.patch(leaderboardId as Id<"leaderboard">, { collected: 1 })
        }
      } else if (battleId) {
        const battle = await ctx.db.get(battleId as Id<"battle">);
        if (battle?.rewards) {
          const reward = battle.rewards.find((r) => r.uid === uid);
          if (reward && !reward.collected) {
            reward.collected = 1;
            await ctx.db.patch(battleId as Id<"battle">, { rewards: battle.rewards })
          }
        }
      }
      return { ok: true }
    }
  },
});
export const schedule = internalMutation({
  handler: async (ctx) => {

    const tournaments = await ctx.db.query("tournament").withIndex("by_status", (q) => q.eq("status", 0)).filter((q) => q.or(q.eq(q.field("type"), 1), q.eq(q.field("type"), 2))).collect();
    for (const tournament of tournaments) {
      if (!tournament.closeTime || !tournament.openTime) continue;
      //settle leaderboard for tournament
      if (!tournament.settled && tournament.closeTime && tournament.closeTime > 0 && tournament.closeTime < (Date.now() - 300000)) {
        const leaders = await ctx.db.query("leaderboard").withIndex("by_tournament_term_score", (q) => q.eq("tournamentId", tournament.id).eq("term", tournament.currentTerm)).order("desc").take(100);
        for (let i = 0; i < leaders.length; i++) {
          const reward = tournament.rewards.find((r) => r.rank === i);
          if (reward) {
            leaders[i].reward = reward.assets;
            await ctx.db.patch(leaders[i]._id, { rank: reward.rank, reward: reward.assets })
          }
        }
        await ctx.db.patch(tournament._id, { closeTime: -1, openTime: -1, settled: 1 })
      }
      //check if launch new tournament
      if (tournament.scheduler && tournament.closeTime === -1 && tournament.closeTime === -1) {
        const scheduler = tournament.scheduler;
        const timeZone = scheduler.timeZone;
        const now = Date.now();
        for (const slot of scheduler.slots) {
          let openTime = -1;
          if (slot.day >= 0) {
            openTime = getMonthDate(timeZone, slot.day, slot.hour, slot.minute).getTime();
          } else if (slot.weekday >= 0) {
            openTime = getWeekDate(timeZone, slot.weekday, slot.hour, slot.minute).getTime();
          }
          if (openTime > 0) {
            const closeTime = openTime + slot.duration * 3600 * 1000;
            if (now > openTime && now < closeTime) {
              if (tournament.settled) {
                const currentTerm = tournament.currentTerm ? tournament.currentTerm + 1 : 1;
                await ctx.db.patch(tournament._id, { openTime, closeTime, currentTerm, settled: 0 });
              } else {
                await ctx.db.patch(tournament._id, { openTime, closeTime, currentTerm: tournament.currentTerm ?? 1 });
              }
              break;
            }
          }
        }
      }
    }
  },
});


