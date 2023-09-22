import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    games: defineTable({
        lastCellId: v.number(),
        cells: v.any(),
        uid: v.string(),
    }),
    events: defineTable({
        name: v.string(),
        gameId: v.optional(v.string()),
        uid: v.optional(v.string()),
        steptime: v.optional(v.number()),
        data: v.any(),
    }),
    rounds: defineTable({
        gameId: v.string(),
        cells: v.any(),
    }),
    battle: defineTable({
        type: v.number(),
        tournamentId: v.string(),
        games: v.any(),
        status: v.number(),
    }),
    tournament: defineTable({
        type: v.number(),
        battleType: v.number(),
        startTime: v.number(),
        endTime: v.number(),
        status: v.number(),
    }),
    asset: defineTable({
        id: v.string(),//uid+type
        type: v.number(),
        uid: v.string(),
        amount: v.number(),
        status: v.number(),
    }),
});