import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const findById = query({
  args: { id: v.number() },
  handler: async (ctx, { id }) => {
    const partner = await ctx.db.query("partner").withIndex("by_pid", (q) => q.eq("pid", id)).unique();
    return partner;
  },
});

export const findByHost = query({
  args: { host: v.string() },
  handler: async (ctx, { host }) => {
    const partner: any = await ctx.db.query("partner").withIndex("by_host", (q) => q.eq("host", host)).unique();
    const providers: { name: string, path: string, data: any }[] = [];
    if (partner && partner.auth && partner.auth.length > 0) {

      for (const au of partner.auth) {
        const provider = await ctx.db.query("authprovider").filter((q) => q.eq(q.field("id"), au.provider)).unique();
        if (provider)
          providers.push({ name: provider.name, path: provider.path, data: au.data })
      }

    }
    return { ...partner, auth: providers, _id: undefined, _creationTime: undefined };
  },
});
export const findAuthProvider = query({
  args: { host: v.string() },
  handler: async (ctx, { host }) => {
    const providers: any[] = [];
    const partner = await ctx.db.query("partner").withIndex("by_host", (q) => q.eq("host", host)).unique();
    if (partner?.auth) {
      for (const auth of partner.auth) {
        const provider = await ctx.db.query("authprovider").filter((q) => q.eq(q.field("id"), auth.provider)).unique();
        if (provider) {
          const { name, path } = provider;
          providers.push({ name, path, data: auth.data })
        }
      }
    }
    return providers;
  },
});
export const create = mutation({
  args: { name: v.string(), email: v.optional(v.string()), host: v.string() },
  handler: async (ctx, { name, email, host }) => {
    const p = await ctx.db.query("partner").order("desc").first();
    const pid = p ? p.pid + 1 : 1000;
    await ctx.db.insert("partner", { name, email, host, pid });
    return pid;
  },
});
export const update = mutation({
  args: { id: v.number(), data: v.any() },
  handler: async (ctx, { id, data }) => {
    const partner = await ctx.db.query("partner").withIndex("by_pid", (q) => q.eq("pid", id)).unique();
    if (partner)
      await ctx.db.patch(partner._id, { ...data });
  },
});