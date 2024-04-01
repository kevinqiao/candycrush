import { v } from "convex/values";
import { BATTLE_COUNT_DOWN_TIME } from "../model/Constants";
import { initGame } from "../service/GameEngine";
import * as Utils from "../util/Utils";
import { Id } from "./_generated/dataModel";
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
    if (allToMatch.length == 1) {
      const waitTime = Date.now() - allToMatch[0]['_creationTime'];
      if (waitTime < 8000) return
    }
    if (allToMatch.length > 0) {
      const diffcult = await ctx.db.query("diffcult")
        .filter((q) => q.and(q.eq(q.field("level"), 1), q.eq(q.field("hard"), 1))).unique();
      const tournament = await ctx.db.query("tournament").filter((q) => q.eq(q.field("id"), "2")).order("asc").first();
      if (tournament && diffcult) {
        const startTime = Date.now() + BATTLE_COUNT_DOWN_TIME;
        const battle: any = { tournamentId: tournament.id, participants: tournament.participants, diffcult: diffcult?.id, startTime, duration: tournament.battleTime };
        battle['duration'] = 60000;
        battle['dueTime'] = startTime + battle['duration'];

        const battleId = await ctx.db.insert("battle", { ...battle, status: 0 });
        const seed = Utils.getRandomSeed(10);

        const m = allToMatch[0];
        await ctx.db.delete(m._id);
        let game;
        let opponentGame;
        if (allToMatch.length === 1) {
          const gameData: { gameId: string; data: any; seed: string; diffcult: string } | null = await createGameInitData(ctx, m.uid, tournament);
          game = { diffcult: diffcult.id, battleId, tid: tournament.id, data: gameData?.data, seed, type: 0, laststep: 0, uid: m.uid, startTime, dueTime: battle['dueTime'], ref: "####" };
          const opponent = await findOpponent(ctx);
          opponentGame = { ...game, uid: opponent, ref: gameData?.gameId }
        } else {
          const gameInitData = initGame(diffcult, seed);
          game = { diffcult: diffcult.id, battleId, tid: tournament.id, data: gameInitData, seed, type: 0, laststep: 0, uid: m.uid, startTime, dueTime: battle['dueTime'], ref: "####" };
          await ctx.db.delete(allToMatch[1]._id);
          opponentGame = { ...game, uid: allToMatch[1].uid, ref: "####" }
        }

        let gameId = await ctx.db.insert("games", game);
        await ctx.db.insert("events", { name: "gameInited", gameId, data: { gameId, ...game } });
        await ctx.db.insert("events", { name: "battleCreated", uid: m.uid, data: { id: battleId } });
        gameId = await ctx.db.insert("games", opponentGame);
        await ctx.db.insert("events", { name: "gameInited", gameId, data: { gameId, ...opponentGame } });
        await ctx.db.insert("events", { name: "battleCreated", uid: opponentGame['uid'], data: { id: battleId } });
      }
    }
  },
});

const createGameInitData = async (ctx: any, uid: string, tournament: any) => {
  const game = await ctx.db.get("32b04scsrn3ny7qm2sj70tsm9njpcxr" as Id<"games">)
  const event = await ctx.db
    .query("events").withIndex("by_game", (q: any) => q.eq("gameId", "32b04scsrn3ny7qm2sj70tsm9njpcxr"))
    .filter((q: any) => q.eq(q.field("name"), "gameInited"))
    .first();
  if (game && event) {
    return { gameId: "32b04scsrn3ny7qm2sj70tsm9njpcxr", seed: game['seed'] as string, diffcult: game['diffcult'] as string, data: event['data']['data'] }
  }
  return null;

}

const findOpponent = async (ctx: any) => {
  const users = await ctx.db.query("user").filter((q: any) => q.eq(q.field("tenant"), "####")).collect();
  if (users.length > 0) {
    const r = Utils.getRandom(users.length - 1);
    return users[r]._id;
  }
  return null
}