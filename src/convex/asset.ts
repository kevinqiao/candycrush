import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";


export const findUserAssets = internalQuery({
  args: { uid: v.string() },
  handler: async (ctx, { uid }) => {
    const assets = await ctx.db.query("asset").withIndex("by_user", (q) => q.eq("uid", uid)).collect();
    return assets.map((a) => ({ ...a, _id: undefined, _creationTime: undefined }))
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
export const charge = internalMutation({
  args: { uid: v.string(), cost: v.array(v.object({ asset: v.number(), amount: v.number() })) },
  handler: async (ctx, { uid, cost }) => {
    for (const c of cost) {
      const as = await ctx.db.query("asset").withIndex("by_user_asset", (q) => q.eq("uid", uid).eq("asset", c.asset)).unique();
      if (as && as.amount >= c.amount) {
        c.amount = as.amount - c.amount;
        await ctx.db.patch(as._id, { amount: c.amount, lastUpdate: Date.now() });
      } else
        throw new ConvexError("asset balance is not enough");
    }
    console.log(cost)
    await ctx.db.insert("events", { name: "assetUpdated", uid, time: Date.now(), data: cost });
    return 1;
  },
});
export const chargeBack = internalMutation({
  args: { uid: v.string(), cost: v.array(v.object({ asset: v.number(), amount: v.number() })) },
  handler: async (ctx, { uid, cost }) => {
    for (const c of cost) {
      const as = await ctx.db.query("asset").withIndex("by_user_asset", (q) => q.eq("uid", uid).eq("asset", c.asset)).unique();
      if (as) {
        c.amount = as.amount + c.amount;
        await ctx.db.patch(as._id, { amount: c.amount, lastUpdate: Date.now() })
      }
    }
    await ctx.db.insert("events", { name: "assetUpdated", uid, time: Date.now(), data: cost });
    return 1;
  },
});

