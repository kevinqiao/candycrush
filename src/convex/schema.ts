import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    games: defineTable({
        ref: v.optional(v.string()),
        lastCellId: v.number(),
        cells: v.any(),
        uid: v.string(),
        endTime: v.optional(v.number()),
        result: v.optional(v.number()),
        status: v.optional(v.number())
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
        tournamentId: v.id("tournament"),
        games: v.any(),
        lastUpdate: v.optional(v.number()),
        endTime: v.optional(v.number()),
        status: v.number(),//0-open 1-settled
        seed: v.optional(v.string())
    }),
    mybattle: defineTable({
        uid: v.string(),
        battleId: v.string(),
        tournamentId: v.id("tournament"),
        game: v.string(),
        lastUpdate: v.optional(v.number()),
        status: v.number(),//0-open 1-settled
        score: v.number()
    }),
    tournament: defineTable({
        cid: v.number(),
        startTime: v.number(),
        endTime: v.number(),
        rewards: v.optional(v.any()),
        status: v.number(),//0-on going 1-over 2-settled
    }),
    asset: defineTable({
        id: v.string(),//uid+type
        type: v.number(),
        uid: v.string(),
        amount: v.number(),
        status: v.number(),
        lastUpdate: v.optional(v.number())
    }),
    user: defineTable({
        uid: v.string(),
        name: v.string(),
        channel: v.number(),
        email: v.optional(v.string()),
        level: v.number(),
        exp: v.number(),
        status: v.optional(v.number())//0-active 1-removed
    }).index("by_uid", ["uid"]),

    leaderboard: defineTable({
        tournamentId: v.string(),
        uid: v.string(),
        points: v.number(),
        lastUpdate: v.number(),
        reward: v.optional(v.any())
    }).index("by_points", ["points"]),

});