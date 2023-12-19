import { v } from "convex/values";
import * as gameEngine from "../service/GameEngine";
import { Id } from "./_generated/dataModel";

import { GAME_PLAY_TIME } from "../model/Constants";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
export const getInitGame = internalQuery({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("events").withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .filter((q) => q.eq(q.field("name"), "gameInited"))
      .first();
    if (event) {
      const game = await ctx.db.get(args.gameId as Id<"games">);
      return { ...event?.data, seed: game?.seed }
    }
  },
});

export const findInitGame = query({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId as Id<"games">)
    let gameId = game?.ref ?? args.gameId;
    const event = await ctx.db
      .query("events").withIndex("by_game", (q) => q.eq("gameId", gameId))
      .filter((q) => q.eq(q.field("name"), "gameInited"))
      .first();
    return event?.data

  },
});
export const getGame = internalQuery({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    return game;
  },
});
export const findGame = query({
  args: { gameId: v.string() },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.query("games").filter((q) => q.eq(q.field("_id"), gameId)).first();
    if (game) {
      const pasttime = (Date.now() - game._creationTime);
      return Object.assign({}, game, { gameId: game?._id, _id: undefined, _creationTime: undefined, pasttime });
    }
  },
});
export const findUserGame = internalQuery({
  args: { uid: v.string() },
  handler: async (ctx, { uid }) => {
    const game = await ctx.db
      .query("games")
      .filter((q) => q.eq(q.field("uid"), uid)).order("desc")
      .first();
    // if (game && (Date.now() - game._creationTime < 120000)) {
    return game;
    // }
  },
});
export const findBattleGames = internalQuery({
  args: { battleId: v.string() },
  handler: async (ctx, { battleId }) => {
    const games = await ctx.db
      .query("games")
      .filter((q) => q.eq(q.field("battleId"), battleId))
      .collect();
    return games;
  },
});
export const findTosettledGames = internalQuery({
  handler: async (ctx) => {
    const games = await ctx.db
      .query("games")
      .filter((q) => q.and(q.lt(q.field("startTime"), Date.now() - GAME_PLAY_TIME), q.eq(q.field("status"), 0), q.eq(q.field("type"), 0))).order("asc").collect();
    return games;
  },
});
export const findAgentGames = internalQuery({
  handler: async (ctx) => {
    const games = await ctx.db
      .query("games")
      .filter((q) => q.and(q.eq(q.field("status"), 0), q.eq(q.field("type"), 0))).order("asc").collect();
    return games;
  },
});
export const create = internalMutation({
  args: { game: v.any() },
  handler: async (ctx, { game }) => {
    console.log("ref:" + game.ref)
    const gameId = await ctx.db.insert("games", { ...game, laststep: 0 });
    return gameId;
  },
});
export const screate = mutation({
  args: { game: v.any() },
  handler: async (ctx, { game }) => {
    // const cells = initGame();
    const gameId = await ctx.db.insert("games", { ...game, laststep: 0 });
    return gameId;
  },
});
export const update = internalMutation({
  args: { gameId: v.id("games"), data: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.gameId, { ...args.data });
  },
});
export const log = internalMutation({
  args: { gameId: v.string(), cells: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.insert("rounds", { cells: args.cells, gameId: args.gameId });
  },
});



export const autoStep = internalMutation({
  handler: async (ctx) => {
    const bgames = await ctx.db
      .query("bgames")
      .filter((q) => q.eq(q.field("status"), 0)).order("desc").collect();

    for (let bgame of bgames) {
      const steptime = Date.now() - bgame.starttime;
      if (steptime >= 600000) {
        ctx.db.patch(bgame._id, { status: 1 })
      } else {

        const from = bgame.laststep;
        const events = await ctx.db
          .query("events").withIndex("by_game", (q) => q.eq("gameId", bgame.ref))
          .filter((q) => q.and(q.gt(q.field("steptime"), from), q.lte(q.field("steptime"), steptime))).order("asc")
          .collect();
        if (events.length > 0) {
          const game = await ctx.db.get(bgame.gameId as Id<"games">)
          if (game) {
            let laststep = from;
            for (let event of events) {
              laststep = event.steptime ?? laststep;
              gameEngine.handleEvent(event.name, event.data, game);
            }
            ctx.db.patch(game._id, { laststep, cells: game.cells, matched: game.matched })
            ctx.db.patch(bgame._id, { laststep })
          }
        }
      }
    }

  },
});
