import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internalMutation, internalQuery, query } from "./_generated/server";


export const getInitGame = internalQuery({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("events").withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .filter((q) => q.eq(q.field("name"), "gameInited"))
      .first();
    if (event) {
      const game = await ctx.db.get(args.gameId as Id<"games">);
      return { ...event?.data, seed: game?.seed }
    }
  },
});

export const findInitGame = query({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId as Id<"games">)
    const gameId = game?.ref ?? args.gameId;
    const event = await ctx.db
      .query("events").withIndex("by_game", (q) => q.eq("gameId", gameId))
      .filter((q) => q.eq(q.field("name"), "gameInited"))
      .first();
    return event?.data
  },
});
export const getGame = internalQuery({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }): Promise<any> => {
    const game = await ctx.db.get(gameId);
    if (!game) return
    const defender = await ctx.db.query("defender")
      .filter((q) => q.eq(q.field("id"), game.defender)).unique()
    return { ...game, gameId: game._id, _id: undefined, _creationTime: undefined, defender: defender?.data };
  },
});
export const findGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }): Promise<any> => {
    const game = await ctx.db.get(gameId);
    if (game) {
      const defender = await ctx.db.query("defender")
        .filter((q) => q.eq(q.field("id"), game.defender)).unique()
      return { ...game, gameId: game._id, _id: undefined, _creationTime: undefined, defender: defender?.data };
    }
  },
});

// export const findGame = action({
//   args: { gameId: v.string() },
//   handler: async (ctx, { gameId }): Promise<any> => {
//     const gid = gameId as Id<"games">
//     const game = await ctx.runQuery(internal.games.getGame, { gameId: gid });
//     if (game && !game.result) {
//       const result = GameEngine.settleGame(game);
//       if (result && game.gameId) {
//         const score = result['base'] + result['time'] + result['goal'];
//         game.result = result;
//         game.score = score;
//         await ctx.runMutation(internal.games.update, { gameId: gid, data: { result, score, status: GAME_STATUS.SETTLED } })
//       }
//     }
//     return { ...game, gameId: game._id, _id: undefined };
//   },
// });
export const findUserGame = internalQuery({
  args: { uid: v.string() },
  handler: async (ctx, { uid }) => {
    const games = await ctx.db
      .query("games")
      .filter((q) => q.eq(q.field("uid"), uid))
      .order("desc").first();
    return games;
  },
});
export const findBattleGames = internalQuery({
  args: { battleId: v.string() },
  handler: async (ctx, { battleId }) => {
    const games = await ctx.db
      .query("games")
      .filter((q) => q.eq(q.field("battleId"), battleId))
      .collect();
    if (games?.length > 0) {
      console.log("did:" + games[0].defender)
      const defender = await ctx.db.query("defender")
        .filter((q) => q.eq(q.field("id"), games[0].defender)).unique();
      return games.map((g) => Object.assign({}, g, { defender: defender?.data }))
    }
    return games;
  },
});


export const create = internalMutation({
  args: { game: v.any() },
  handler: async (ctx, { game }) => {
    const gameId = await ctx.db.insert("games", { ...game, laststep: 0 });
    return gameId;
  },
});

export const update = internalMutation({
  args: { gameId: v.id("games"), data: v.any() },
  handler: async (ctx, { gameId, data }) => {
    console.log(data)
    await ctx.db.patch(gameId, { ...data });
  },
});
export const log = internalMutation({
  args: { gameId: v.string(), cells: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.insert("rounds", { cells: args.cells, gameId: args.gameId });
  },
});

// export const settleGame = internalMutation({
//   args: { battleId: v.id("battle"), uid: v.string(), gameId: v.string(), score: v.number() },
//   handler: async (ctx, { battleId, gameId, uid, score }) => {
//     const battle = await ctx.db.get(battleId);
//     if (battle && battleId) {
//       const battleObj = Object.assign({}, battle, { id: battleId, _id: undefined })
//       battle.report.push({ uid, gameId, score });
//       if (battle.participants === battle.report.length) {
//         // const tournament = await ctx.db.get(battle.tournamentId as Id<"tournament">);
//         const tournament = await ctx.db.query("tournament").filter((q) => q.eq(q.field("id"), battle.tournamentId)).order("asc").first();
//         if (tournament) {
//           const rewards = countRewards(tournament, battleObj);
//           for (const r of rewards) {
//             if (r.assets) {
//               for (const a of r.assets) {
//                 const asset = await ctx.db.query("asset")
//                   .filter((q) => q.and(q.eq(q.field("type"), a.asset), q.eq(q.field("uid"), r.uid))).first();
//                 if (asset) {
//                   asset.amount = asset.amount + a.amount;
//                   await ctx.db.patch(asset._id, { amount: asset.amount });
//                 } else {
//                   await ctx.db.insert("asset", { uid, type: a.asset, amount: a.amount, lastUpdate: Date.now() });
//                 }
//               }
//             }
//             if (r.points) {
//               const boardItem = await ctx.db.query("leaderboard")
//                 .filter((q) => q.and(q.eq(q.field("tournamentId"), tournament.id), q.eq(q.field("term"), tournament.currentTerm), q.eq(q.field("uid"), r.uid))).first();
//               if (boardItem) {
//                 await ctx.db.patch(boardItem._id, { points: boardItem.points + r.points });
//               } else {
//                 const term = tournament.currentTerm ?? 0;
//                 await ctx.db.insert("leaderboard", { uid: r.uid, tournamentId: tournament.id, term, points: r.points, lastUpdate: Date.now() })
//               }
//             }
//           }
//           battle.rewards = rewards
//           battle.status = 1;
//         }

//       }
//       await ctx.db.patch(battle._id, { status: battle.status, report: battle.report, rewards: battle.rewards })
//     }
//     return battle;
//   }
// });


// export const autoStep = internalMutation({
//   handler: async (ctx) => {
//     const bgames = await ctx.db
//       .query("bgames")
//       .filter((q) => q.eq(q.field("status"), 0)).order("desc").collect();

//     for (let bgame of bgames) {
//       const steptime = Date.now() - bgame.starttime;
//       if (steptime >= 600000) {
//         ctx.db.patch(bgame._id, { status: 1 })
//       } else {

//         const from = bgame.laststep;
//         const events = await ctx.db
//           .query("events").withIndex("by_game", (q) => q.eq("gameId", bgame.ref))
//           .filter((q) => q.and(q.gt(q.field("steptime"), from), q.lte(q.field("steptime"), steptime))).order("asc")
//           .collect();
//         if (events.length > 0) {
//           const game = await ctx.db.get(bgame.gameId as Id<"games">)
//           if (game) {
//             let laststep = from;
//             for (let event of events) {
//               laststep = event.steptime ?? laststep;
//               gameEngine.handleEvent(event.name, event.data, game);
//             }
//             ctx.db.patch(game._id, { laststep, cells: game.cells, matched: game.matched })
//             ctx.db.patch(bgame._id, { laststep })
//           }
//         }
//       }
//     }

//   },
// });
