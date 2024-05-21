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
        uid: v.string(),
        tid: v.string(),//tournament type(config) id
        battleId: v.string(),
        ref: v.optional(v.string()),
        seed: v.string(),
        diffcult: v.string(),
        laststep: v.optional(v.number()),
        startTime: v.optional(v.number()),
        dueTime: v.optional(v.number()),
        result: v.optional(v.object({ base: v.number(), time: v.number(), goal: v.number() })),//{base:number;time:number;goal:number}
        score: v.optional(v.number()),//final score used by index
        status: v.optional(v.number()),//0-open 1-settled 2-rewarded
        type: v.number(),//
        data: v.object({ cells: v.array(v.any()), matched: v.optional(v.array(v.any())), skillBuff: v.array(v.object({ skill: v.number(), progress: v.number() })), move: v.optional(v.number()), lastCellId: v.number(), goalCompleteTime: v.optional(v.number()) })
    }).index("by_type", ["type"]).index("by_status", ["status"]),
    events: defineTable({
        name: v.string(),
        battleId: v.optional(v.string()),
        gameId: v.optional(v.string()),
        uid: v.optional(v.string()),
        steptime: v.optional(v.number()),
        time: v.optional(v.number()),
        actionId: v.optional(v.number()),
        data: v.any(),
    }).index("by_game", ["gameId"]).index("by_uid", ["uid"]).index("by_battle", ["battleId"]),
    // rounds: defineTable({
    //     gameId: v.string(),
    //     cells: v.any(),
    // }),
    diffcult: defineTable({
        id: v.string(),
        level: v.number(),
        hard: v.number(),
        data: v.any(),
    }).index("by_level", ["level"]).index("by_hard", ["hard"]).index("by_did", ["id"]),

    battle: defineTable({
        type: v.optional(v.number()),
        participants: v.number(),
        tournamentId: v.string(),
        term: v.optional(v.number()),//schedule tournament term
        // uid: r.uid, gameId: r._id, rank: index, score: r.score, assets: [] 
        rewards: v.optional(v.array(v.object({ uid: v.string(), gameId: v.string(), rank: v.number(), score: v.number(), points: v.optional(v.number()), assets: v.array(v.object({ asset: v.number(), amount: v.number() })) }))),
        startTime: v.number(),
        dueTime: v.optional(v.number()),
        duration: v.number(),
        status: v.number(),//0-going 1-settled 2-cancelled
        diffcult: v.string(),
    }),

    tournament: defineTable({
        id: v.string(),
        context: v.optional(v.string()),
        creator: v.optional(v.string()),
        type: v.optional(v.number()),//0-one battle for all  1-scoring rank by pvp point 2-scoring rank by  best score
        participants: v.number(),
        battle: v.object({ type: v.number(), duration: v.number(), sessions: v.number(), players: v.number() }),
        openTime: v.optional(v.number()),
        closeTime: v.optional(v.number()),
        scheduler: v.optional(v.object({ day: v.number(), weekday: v.number(), hour: v.number(), minute: v.number() })),
        entry: v.optional(v.object({ level: v.number(), cost: v.array(v.object({ asset: v.number(), amount: v.number() })) })),
        rewards: v.array(v.object({ rank: v.number(), points: v.optional(v.number()), assets: v.array(v.object({ asset: v.number(), amount: v.number() })) })),
    }),
    asset: defineTable({
        type: v.number(),
        uid: v.string(),
        amount: v.number(),
        lastUpdate: v.optional(v.number())
    }),
    cuser: defineTable({
        cid: v.string(),
        cuid: v.string(),
        channel: v.number(),
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        data: v.optional(v.any())
    }),
    user: defineTable({
        name: v.string(),
        avatar: v.optional(v.number()),
        cuid: v.string(),
        token: v.optional(v.string()),
        tenant: v.optional(v.string()),
        lastUpdate: v.optional(v.number()),
        lastEventTime: v.optional(v.number()),
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
    matchqueue: defineTable({
        uid: v.string(),
        tournamentId: v.string(),
    }),
    leaderboard: defineTable({
        tournamentId: v.string(),
        uid: v.string(),
        score: v.number(),
        lastUpdate: v.number(),
    }).index("by_tournament", ["tournamentId"]).index("by_score", ["score"]).index("by_lastupdate", ["lastUpdate"]),

});