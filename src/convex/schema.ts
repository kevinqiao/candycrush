import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    bgames: defineTable({
        gameId: v.string(),
        laststep: v.number(),
        starttime: v.number(),
        endTime: v.optional(v.number()),
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
        tid: v.string(),//tournament type(config) id
        battleId: v.string(),
        ref: v.optional(v.string()),
        seed: v.string(),
        lastCellId: v.optional(v.number()),
        cells: v.any(),
        uid: v.string(),
        matched: v.optional(v.any()),
        laststep: v.optional(v.number()),
        startTime: v.optional(v.number()),
        endTime: v.optional(v.number()),
        result: v.optional(v.any()),
        score: v.optional(v.number()),
        status: v.optional(v.number()),
        type: v.number(),//0-play 1-agent
        goal: v.number(),
        chunk: v.optional(v.number())
    }).index("by_type", ["type"]).index("by_status", ["status"]),
    events: defineTable({
        name: v.string(),
        battleId: v.optional(v.string()),
        gameId: v.optional(v.string()),
        uid: v.optional(v.string()),
        steptime: v.optional(v.number()),
        data: v.any(),
    }).index("by_game", ["gameId"]).index("by_uid", ["uid"]).index("by_battle", ["battleId"]),
    rounds: defineTable({
        gameId: v.string(),
        cells: v.any(),
    }),

    battle: defineTable({
        type: v.optional(v.number()),
        participants: v.number(),
        tournamentId: v.string(),
        term: v.optional(v.number()),//schedule tournament term
        report: v.optional(v.any()),
        rewards: v.optional(v.any()),
        startTime: v.number(),
        status: v.optional(v.number()),//0-going 1-settled 2-cancelled
        seed: v.optional(v.string()),
        row: v.number(),
        column: v.number(),
        goal: v.optional(v.number()),
        chunk: v.optional(v.number())
    }),

    tournament: defineTable({
        id: v.string(),
        participants: v.number(),
        battleTime: v.number(),
        type: v.number(),//0-unlimit 1-schedule
        currentTerm: v.optional(v.number()),
        schedule: v.optional(v.any()),
        goal: v.number(),
        cost: v.optional(v.any()),
        rewards: v.any(),
        status: v.number(),//0-on going 1-over 2-settled
    }),
    asset: defineTable({
        type: v.number(),
        uid: v.string(),
        amount: v.number(),
        lastUpdate: v.optional(v.number())
    }),
    channelUser: defineTable({
        uid: v.string(),
        cid: v.string(),
        channel: v.number(),
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        data: v.optional(v.any())
    }),
    user: defineTable({
        uid: v.string(),
        name: v.string(),
        channel: v.number(),
        partner: v.optional(v.string()),
        lastUpdate: v.optional(v.number()),
        email: v.optional(v.string()),
        status: v.optional(v.number())//0-active 1-removed
    }),
    partner: defineTable({
        pid: v.string(),
        name: v.string(),
        desc: v.string(),
        contact: v.string()
    }),
    transaction: defineTable({
        tid: v.string(),
        type: v.number(),//0-credit 1-debit
        asset: v.number(),
        amount: v.number(),
        uid: v.string()
    }),
    leaderboard: defineTable({
        tournamentId: v.string(),
        term: v.number(),
        uid: v.string(),
        points: v.number(),
        lastUpdate: v.number(),
        reward: v.optional(v.any())
    }).index("by_points", ["points"]),

});