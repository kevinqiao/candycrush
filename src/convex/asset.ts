import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { sessionQuery } from "./custom/session";

export const findByUser = sessionQuery({
  args: {},
  handler: async (ctx, args) => {
    if (!ctx.user) return;
    const { uid } = ctx.user
    const assets = await ctx.db.query("asset").withIndex("by_user", (q) => q.eq("uid", uid)).collect();
    return assets.map((a) => ({ ...a, _id: undefined, _creationTime: undefined }))
  },
});
export const find = internalQuery({
  args: { uid: v.string(), type: v.number() },
  handler: async (ctx, { uid, type }) => {
    const asset = await ctx.db.query("asset")
      .filter((q) => q.and(q.eq(q.field("asset"), type), q.eq(q.field("uid"), uid))).first();
    return asset
  },
});
export const create = internalMutation({
  args: { uid: v.string(), asset: v.number(), amount: v.number() },
  handler: async (ctx, { uid, asset, amount }) => {
    const assetId = await ctx.db.insert("asset", { uid, asset, amount, lastUpdate: Date.now() });
    return assetId;
  },
});
export const update = internalMutation({
  args: { assetId: v.id("asset"), amount: v.number() },
  handler: async (ctx, { assetId, amount }) => {
    await ctx.db.patch(assetId, { amount, lastUpdate: Date.now() });
  },
});

