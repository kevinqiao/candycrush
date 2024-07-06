"use node";
import { v } from "convex/values";
import { CHANNEL_AUTH } from "../model/Constants";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";

const verifyClerk = async (data: any): Promise<{ cid: string; username: string; email?: string; phone?: string; token: string } | null> => {
  const { jwttoken } = data;
  if (jwttoken) {
    const url = "https://bot.fungift.org/clerk/token/decode";
    const res = await fetch(url, {
      method: "GET", // 或 'POST', 'PUT', 'DELETE' 等
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwttoken}`, // 将 token 添加到请求头中
        mode: "cors",
      },
    });
    const json = await res.json();
    if (json.ok) {
      const { cid, username, email, phone, token } = json.message;
      return { cid, username, email, phone, token }
    }

  }
  return null;
}
const verifyTelegram = async (data: any): Promise<{ cid: string; username: string; email?: string; phone?: string; token: string } | null> => {
  const BOT_URL = "https://bot.fungift.org/tg/auth";
  const res = await fetch(BOT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ authData: data.authData }),
  })
  const json = await res.json();
  if (json.ok) {
    return json.message
  }
  return null;
}
export const authorize = action({
  args: { partner: v.number(), app: v.optional(v.string()), channelId: v.number(), data: v.any() },
  handler: async (ctx, { app, channelId, partner, data }): Promise<any> => {
    const channel = await ctx.runQuery(internal.authchannel.find, { id: channelId })
    if (!channel) return;
    let auth;
    switch (channel.authenticator) {
      case "1":
        break;
      case "clerk":
        auth = await verifyClerk(data);
        break;
      case "telegram":
        auth = await verifyTelegram(data);
        break;
      case "4":

        break;
      case "5":

        break;
      default:
        break;
    }
    console.log(auth)
    if (auth) {
      const user = await ctx.runMutation(internal.user.authorize, { ...auth, channel: 1, partner });
      await ctx.runMutation(internal.asset.update, { uid: user.uid, asset: 1, amount: 100 });
      await ctx.runMutation(internal.asset.update, { uid: user.uid, asset: 2, amount: 100 });

      const game = await ctx.runQuery(internal.games.findUserGame, { uid: user.uid });
      if (game?.battleId && !game.status) {
        const battle = await ctx.runQuery(internal.battle.findById, { battleId: game.battleId as Id<"battle"> })
        if (battle && ((battle.duration + battle.startTime) > Date.now()))
          user['battleId'] = battle._id
      }
      const matching = await ctx.runQuery(internal.matchqueue.finByUid, { uid: user.uid });
      if (matching)
        user['insearch'] = 1;
      const assets = await ctx.runQuery(internal.asset.findUserAssets, { uid: user.uid });
      if (assets)
        user['assets'] = assets
      return { ok: true, message: user };
    }
    return { ok: true, message: auth }
  },
});
export const authorizeClerk = action({
  args: { jwttoken: v.string(), partner: v.number(), app: v.optional(v.string()) },
  handler: async (ctx, { jwttoken, partner }): Promise<any> => {
    const url = "https://telegram-bot-8bgi.onrender.com/clerk/token/decode";
    const res = await fetch(url, {
      method: "GET", // 或 'POST', 'PUT', 'DELETE' 等
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwttoken}`, // 将 token 添加到请求头中
        mode: "cors",
      },
    });
    const json = await res.json();
    if (json.ok) {
      const user = await ctx.runMutation(internal.user.authorize, { ...json.data, channel: CHANNEL_AUTH.CLERK, partner });
      console.log("token:" + user.token)
      return { ok: true, message: user };
    }
    return { ok: false }
  },
});
