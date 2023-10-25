import { v } from "convex/values";
import * as gameEngine from "../service/GameEngine";
import { Id } from "./_generated/dataModel";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
export const getInitGame = internalQuery({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("events")
      .filter((q) => q.and(q.eq(q.field("gameId"), args.gameId), q.eq(q.field("name"), "gameInited")))
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
      .query("events")
      .filter((q) => q.and(q.eq(q.field("gameId"), gameId), q.eq(q.field("name"), "gameInited")))
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
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    if (game) {
      const score = gameEngine.getScore(game);
      const pasttime = (Date.now() - game._creationTime);
      return Object.assign({}, game, { gameId: game?._id, _id: undefined, _creationTime: undefined, pasttime, score });
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
export const list = query({
  args: {},
  handler: async (ctx) => {
    // Grab the most recent messages.
    const games = await ctx.db.query("games").take(100);
    // Reverse the list so that it's in a chronological order.
    return games.reverse();
  },
});
export const create = internalMutation({
  args: { game: v.any() },
  handler: async (ctx, { game }) => {
    console.log("game seed:" + game.seed)
    const gameId = await ctx.db.insert("games", { ...game, lastUpdate: Date.now(), laststep: 0 });
    return gameId;
  },
});
export const screate = mutation({
  args: { game: v.any() },
  handler: async (ctx, { game }) => {
    // const cells = initGame();
    const gameId = await ctx.db.insert("games", { ...game, lastUpdate: Date.now(), laststep: 0 });
    return gameId;
  },
});
export const update = internalMutation({
  args: { gameId: v.id("games"), data: v.any() },
  handler: async (ctx, args) => {
    // const items = args.cells as CellItem[];
    await ctx.db.patch(args.gameId, { ...args.data, lastUpdate: Date.now() });
  },
});
export const log = internalMutation({
  args: { gameId: v.string(), cells: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.insert("rounds", { cells: args.cells, gameId: args.gameId });
  },
});
