import { v } from "convex/values";
import { query } from "./_generated/server";



export const find = query({
  args: { uid: v.id("account") },
  handler: async (ctx, { uid }) => {
    return null
  },
});

