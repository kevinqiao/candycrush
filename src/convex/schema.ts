import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    bgames: defineTable({
        gameId: v.string(),
        laststep: v.number(),
        starttime: v.number(),
        endTime: v.number(),
        ref: v.string(),
        status: v.number()
    }),
    gameseeds: defineTable({
        seed: v.string(),
        top: v.number(),
        bottom: v.number(),
        average: v.number(),
        counts: v.number()
    }),
    games: defineTable({
        tcid: v.string(),//tournament type(config) id
        battleId: v.string(),
        ref: v.optional(v.string()),
        seed: v.string(),
        lastCellId: v.optional(v.number()),
        cells: v.optional(v.any()),
        uid: v.string(),
        matched: v.optional(v.any()),
        laststep: v.optional(v.number()),
        lastUpdate: v.optional(v.number()),
        endTime: v.optional(v.number()),
        result: v.optional(v.number()),
        status: v.optional(v.number()),
        score: v.optional(v.any())
    }),
    events: defineTable({
        name: v.string(),
        gameId: v.optional(v.string()),
        lastCellId: v.optional(v.number()),
        uid: v.optional(v.string()),
        steptime: v.optional(v.number()),
        data: v.any(),
    }),
    rounds: defineTable({
        gameId: v.string(),
        cells: v.any(),
    }),
    glog: defineTable({
        name: v.string(),
        data: v.any(),
    }),
    battle: defineTable({
        type: v.number(),
        tournamentId: v.id("tournament"),
        lastupdate: v.optional(v.number()),
        stoptime: v.optional(v.number()),
        status: v.number(),//0-going 1-settled 2-cancelled
        seed: v.optional(v.string())
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
        lastUpdate: v.optional(v.number()),
        email: v.optional(v.string()),
        status: v.optional(v.number())//0-active 1-removed
    }),

    leaderboard: defineTable({
        tournamentId: v.string(),
        uid: v.string(),
        points: v.number(),
        lastUpdate: v.number(),
        reward: v.optional(v.any())
    }).index("by_points", ["points"]),



});