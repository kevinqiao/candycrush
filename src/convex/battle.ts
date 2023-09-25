import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const create = internalMutation({
  args: { tournamentId: v.id("tournament"), type: v.number(), games: v.any(), status: v.number() },
  handler: async (ctx, { tournamentId, type, games, status }) => {
    return await ctx.db.insert("battle", { tournamentId, type, games, status });
  },
});

