import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
export const find = query({
  //app:consumer/merchant
  args: { pid: v.optional(v.number()), host: v.optional(v.string()), app: v.string(), channelId: v.number() },
  handler: async (ctx, { pid, host, app, channelId }) => {
    console.log(pid + ":" + host + ":" + app + ":" + channelId)
    const res: { ok: boolean; message?: any; errorCode?: number } = { ok: false };
    let partner;
    if (pid) {
      partner = await ctx.db.query("partner").withIndex("by_pid", (q) => q.eq("pid", pid)).unique();
    } else if (host) {
      const domain = ".fungift.org";
      const hostname = host.indexOf(domain) < 0 ? host : host.substring(0, host.length - domain.length);
      partner = await ctx.db.query("partner").withIndex("by_host", (q) => q.eq("host", hostname)).unique();
    }
    if (partner) {

      const auth: { channels: number[]; role: number } | null = partner.auth[app];
      if (auth && (channelId === 0 || auth.channels.includes(channelId))) {

        const cid = channelId > 0 ? channelId : auth.channels[0]
        const channel = await ctx.db.query("authchannel").withIndex("by_channelId", (q) => q.eq("id", cid)).unique();
        if (channel) {
          const authenticator = await ctx.db.query("authenticator").withIndex("by_name", (q) => q.eq("name", channel.authenticator)).unique();
          res.message = { ...partner, _id: undefined, _creationTime: undefined, auth: { ...authenticator, channel: channel.id, data: channel['data']['public'], _id: undefined, _creationTime: undefined } }
          res.ok = true;
        }
      } else
        res.errorCode = 2
    } else {
      res.errorCode = 1;
    }
    return res;
  },
});



export const create = mutation({
  args: { name: v.string(), email: v.optional(v.string()), host: v.string(), auth: v.any() },
  handler: async (ctx, { name, email, host, auth }) => {
    const p = await ctx.db.query("partner").order("desc").first();
    const pid = p ? p.pid + 1 : 1000;
    await ctx.db.insert("partner", { name, email, host, pid, auth });
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