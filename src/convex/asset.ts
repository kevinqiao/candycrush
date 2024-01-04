import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const findAll = internalQuery({
  args: { uid: v.string() },
  handler: async (ctx, args) => {
    const assets = await ctx.db.query("asset")
      .filter((q) => q.eq(q.field("uid"), args.uid))
      .collect();
    return assets
  },
});
export const find = internalQuery({
  args: { uid: v.string(), type: v.number() },
  handler: async (ctx, { uid, type }) => {   
    const asset = await ctx.db.query("asset")
      .filter((q) =>q.and(q.eq(q.field("type"),type), q.eq(q.field("uid"), uid))).first();
    return asset
  },
});
export const create = internalMutation({
  args: { uid: v.string(), type: v.number(), amount: v.number() },
  handler: async (ctx, { uid, type, amount }) => {
    const assetId = await ctx.db.insert("asset", {  uid, type, amount,  lastUpdate: Date.now() });
    return assetId;
  },
});
export const update = internalMutation({
  args: { assetId: v.id("asset"), amount: v.number() },
  handler: async (ctx, { assetId, amount }) => {
    await ctx.db.patch(assetId, { amount, lastUpdate: Date.now() });
  },
});

