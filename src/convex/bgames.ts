import { v } from "convex/values";
import { BATTLE_DURATION } from "../model/Constants";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";


export const getAll = query({
  handler: async (ctx) => {
    const bgames = await ctx.db
      .query("bgames")
      .filter((q) => q.and(q.eq(q.field("status"), 0), q.gt(q.field("starttime"), Date.now() - BATTLE_DURATION))).order("desc").collect();
    return bgames.map((b) => Object.assign({}, b, { pasttime: b.starttime === 0 ? b.starttime : Date.now() - b.starttime }))
  },
});


export const findAll = internalQuery({
  handler: async (ctx) => {
    const bgames = await ctx.db
      .query("bgames")
      .filter((q) => q.eq(q.field("status"), 0)).order("desc").collect()
    return bgames
  },
});
export const create = internalMutation({
  args: { gameId: v.string(), ref: v.string() },
  handler: async (ctx, args) => {
    // const cells = initGame();
    await ctx.db.insert("bgames", { ...args, endTime: Date.now() + 360000, status: 0, laststep: 0, starttime: Date.now() });
  },
});
export const update = internalMutation({
  args: { id: v.id("bgames"), data: v.any() },
  handler: async (ctx, args) => {
    // const items = args.cells as CellItem[];
    await ctx.db.patch(args.id, { ...args.data });
  },
});
export const supdate = mutation({
  args: { id: v.id("bgames"), data: v.any() },
  handler: async (ctx, args) => {
    // const items = args.cells as CellItem[];
    await ctx.db.patch(args.id, { ...args.data, starttime: Date.now() });
  },
});
