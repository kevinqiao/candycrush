import { customAction } from "convex-helpers/server/customFunctions";
import { v } from "convex/values";
import { action } from "../_generated/server";

export const sessionAction = customAction(action, {
    // Argument validation for sessionMutation: two named args here.
    args: { sessionId: v.optional(v.string()) },
    // The function handler, taking the validated arguments and context.
    input: async (ctx, { sessionId }) => {
        console.log("session:" + sessionId)
        const user = { uid: "kqiao", token: sessionId };
        // Note: we're passing args through, so they'll be available below
        return { ctx: { user }, args: {} };
    }
})