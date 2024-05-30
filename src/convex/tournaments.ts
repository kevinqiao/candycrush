import { v } from "convex/values";
import { getMonthDate, getWeekDate } from "../util/Utils";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { internalMutation, internalQuery } from "./_generated/server";
import { sessionAction, sessionQuery } from "./custom/session";
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
    console.log(ctx.user)
    const tournaments = await ctx.db.query("tournament").collect();
    // tournaments.forEach((t) => {
    //   if (t.closeTime)
    //     t.closeTime = t.closeTime - Date.now();
    // })
    const tlist = tournaments.map((t) => ({ ...t, _id: undefined, scheduler: undefined }))


    return tlist
  },
});
export const collect = sessionAction({
  args: { battleId: v.optional(v.string()), leaderboardId: v.optional(v.string()) },
  handler: async (ctx, { battleId, leaderboardId }): Promise<any> => {

    if (ctx.user) {
      const { uid } = ctx.user;
      if (battleId) {
        await ctx.runMutation(internal.battle.collect, { battleId: battleId as Id<"battle">, uid });
      } else if (leaderboardId) {
        await ctx.runMutation(internal.leaderboard.collect, { leaderboardId: leaderboardId as Id<"leaderboard">, uid });
      }
      return { ok: true }
    }
  },
});
export const schedule = internalMutation({
  handler: async (ctx) => {
    // Grab the most recent messages.
    const tournaments = await ctx.db.query("tournament").filter((q) => q.or(q.eq(q.field("type"), 1), q.eq(q.field("type"), 2))).collect();
    for (const tournament of tournaments) {
      //settle leaderboard for tournament
      if (!tournament.settled && tournament.closeTime && tournament.closeTime < Date.now()) {
        const leaders = await ctx.db.query("leaderboard").withIndex("by_tournament_term_score", (q) => q.eq("tournamentId", tournament.id).eq("term", tournament.currentTerm)).order("desc").take(100);
        for (let i = 0; i < leaders.length; i++) {
          const reward = tournament.rewards.find((r) => r.rank === i);
          if (reward)
            leaders[i].reward = reward.assets;
        }
        await ctx.db.patch(tournament._id, { settled: 1 })
      }
      //launch new tournament
      if (tournament.scheduler && (tournament.settled || !tournament.openTime)) {
        const scheduler = tournament.scheduler;
        const timeZone = scheduler.timeZone;
        const now = Date.now();
        for (const slot of scheduler.slots) {
          let openTime = -1;
          if (slot.day >= 0) {
            console.log(slot)
            openTime = getMonthDate(timeZone, slot.day, slot.hour, slot.minute).getTime();
          } else if (slot.weekday >= 0) {
            openTime = getWeekDate(timeZone, slot.weekday, slot.hour, slot.minute).getTime();
          }

          const closeTime = openTime + slot.duration * 3600 * 1000;
          console.log(now + ":" + openTime + ":" + closeTime)
          if (now > openTime && now < closeTime) {
            console.log("launch new tournament")
            const currentTerm = tournament.currentTerm ? tournament.currentTerm + 1 : 1;
            await ctx.db.patch(tournament._id, { openTime, closeTime, currentTerm, settled: 0 });
          }
        }
      }
    }
  },
});


