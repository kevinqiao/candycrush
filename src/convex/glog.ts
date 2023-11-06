import { v } from "convex/values";
import { internalMutation } from "./_generated/server";


export const create = internalMutation({
  args: { name: v.string(), data: v.any() },
  handler: async (ctx, { name, data }) => {
    const lid = await ctx.db.insert("glog", { name, data });
    return lid;
  },
});


