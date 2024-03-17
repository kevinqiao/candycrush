import { v } from "convex/values";
import { BATTLE_COUNT_DOWN_TIME } from "../model/Constants";
import { initGame } from "../service/GameEngine";
import * as Utils from "../util/Utils";
import { internalMutation, internalQuery } from "./_generated/server";
export const finByUid = internalQuery({
  args: {
    uid: v.string()
  },
  handler: async (ctx, { uid }) => {
    const ms = await ctx.db.query("matchqueue").filter((q) => q.eq(q.field("uid"), uid)).unique();
    return ms;
  },
});
export const findAll = internalQuery({
  handler: async (ctx) => {
    const ms = await ctx.db.query("matchqueue").collect();
    return ms
  },
});
export const create = internalMutation({
  args: { uid: v.string(), tournamentId: v.string(), term: v.optional(v.number()) },
  handler: async (ctx, { uid, tournamentId, term }) => {
    const t = term ? term : 0;
    const qid = await ctx.db.insert("matchqueue", { uid, tournamentId, term: t });
    return qid;
  },
});
export const remove = internalMutation({
  args: { id: v.id("matchqueue") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
export const settleMatch = internalMutation({
  handler: async (ctx) => {
    const allToMatch = await ctx.db.query("matchqueue").collect();
    if (allToMatch.length > 0) {
      const diffcult = await ctx.db.query("diffcult")
        .filter((q) => q.and(q.eq(q.field("level"), 1), q.eq(q.field("hard"), 1))).unique();
      const tournament = await ctx.db.query("tournament").filter((q) => q.eq(q.field("id"), "2")).order("asc").first();
      if (tournament && diffcult) {
        const startTime = Date.now() + BATTLE_COUNT_DOWN_TIME;
        const battle: any = { tournamentId: tournament.id, participants: tournament.participants, diffcult: diffcult?.id, startTime, duration: tournament.battleTime };
        // battle['duration'] = 60000;
        battle['endDueTime'] = startTime + battle['duration'];
        const battleId = await ctx.db.insert("battle", { ...battle, status: 0 });
        const seed = Utils.getRandomSeed(10);
        const gameInited = initGame(diffcult, seed);
        if (gameInited) {
          const m = allToMatch[0];
          await ctx.db.delete(m._id);
          let opponentId;
          if (allToMatch.length > 1) {
            opponentId = allToMatch[1].uid;
            await ctx.db.delete(allToMatch[1]._id)
          } else {
            const users = await ctx.db.query("user").filter((q) => q.eq(q.field("tenant"), "####")).collect();
            if (users.length > 0) {
              const r = Utils.getRandom(users.length - 1);
              opponentId = users[r]._id;
            }
          }

          if (opponentId) {
            const game = { diffcult: diffcult.id, battleId, tid: tournament.id, data: gameInited, seed, type: 0, laststep: 0 }
            let gameId = await ctx.db.insert("games", { ...game, laststep: 0, uid: m.uid });
            await ctx.db.insert("events", { name: "gameInited", gameId, data: { gameId, ...game } });
            await ctx.db.insert("events", { name: "battleCreated", uid: m.uid, data: { id: battleId } });
            gameId = await ctx.db.insert("games", { ...game, uid: opponentId });
            await ctx.db.insert("events", { name: "gameInited", gameId, data: { gameId, ...game } });
            await ctx.db.insert("events", { name: "battleCreated", uid: opponentId, data: { id: battleId } });

          }
        }
      }
    }
  },
});

