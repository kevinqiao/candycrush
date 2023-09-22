import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";

export const findInitGame = query({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("events")
      .filter((q) => q.and(q.eq(q.field("gameId"), args.gameId), q.eq(q.field("name"), "gameInited")))
      .first();

    return event?.data

  },
});
export const getGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    return { cells: game?.cells, seed: "1111", lastCellId: game?.lastCellId, gameId: game?._id as string };
  },
});
export const findGame = internalQuery({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    console.log("find game:" + gameId)
    const game = await ctx.db.get(gameId);
    return game;
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
    // const cells = initGame();
    const gameId = await ctx.db.insert("games", game);
    return gameId;
  },
});
export const update = internalMutation({
  args: { gameId: v.id("games"), lastCellId: v.number(), cells: v.any() },
  handler: async (ctx, args) => {
    // const items = args.cells as CellItem[];
    await ctx.db.patch(args.gameId, { cells: args.cells, lastCellId: args.lastCellId });
    console.log("cells size:" + args.cells.length)
  },
});
export const log = internalMutation({
  args: { gameId: v.string(), cells: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.insert("rounds", { cells: args.cells, gameId: args.gameId });
  },
});
