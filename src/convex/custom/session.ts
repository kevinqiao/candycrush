import { customAction, customCtx, customQuery } from "convex-helpers/server/customFunctions";
import { v } from "convex/values";
import { action, query } from "../_generated/server";

export const sessionAction = customAction(action, {
    // Argument validation for sessionMutation: two named args here.
    args: { uid: v.string(), token: v.string() },
    // The function handler, taking the validated arguments and context.
    input: async (ctx, { uid, token }) => {
        const user = { uid, token };
        // Note: we're passing args through, so they'll be available below
        return { ctx: { user }, args: {} };
    }
})


export const sessionQuery = customQuery(
    query, // The base function we're extending

    customCtx(async (ctx) => {
        // Look up the logged in user
        return { user: { uid: "1", token: "kqiao" } };
    })
);


