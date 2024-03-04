import { v } from "convex/values";
import { BATTLE_STATUS } from "../model/Constants";
import * as GameEngine from "../service/GameEngine";
import { countRewards, settleGame } from "../service/GameEngine";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { sessionQuery } from "./custom/session";
// interface Tournament {
//   id: string;
//   type?: number;//0-unlimit 1-schedule
//   participants: number;
//   battleTime: number;
//   currentTerm?: number;
//   schedule?: { startDay: number; duration: number };
//   goals?: number[],
//   cost?: { asset: number; amount: number }[],
//   rewards?: { rank: number; assets: { asset: number; amount: number }[]; points: number }[],
//   status: number,//0-on going 1-over 2-settled
// }
// export interface BattleModel {
//   type?: number;//0-solo 1-sync 2-turn 3-replay
//   column: number;
//   row: number;
//   tournamentId: string;
//   report?: { uid: string; gameId: string; score: number }[];
//   rewards?: BattleReward[];
//   status?: number;//0-active 1-over 2-settled
//   goal?: number;
// }
// export type BattleReward = {
//   uid: string;
//   gameId: string;
//   rank: number;
//   score: number;
//   points?: number;
//   assets?: { asset: number, amount: number }[]
// }

// const countRewards = (tournament: Tournament, battle: BattleModel): BattleReward[] => {
//   const rewards: BattleReward[] = [];
//   if (battle.report && battle.report.length > 0) {
//     battle.report.sort((a, b) => b.score - a.score).forEach((r, index) => {
//       const reward = tournament.rewards?.find((w) => w.rank === index);
//       if (reward) {
//         rewards.push({ uid: r.uid, gameId: r.gameId, rank: index, score: r.score, points: reward.points, assets: reward.assets })
//       }
//     })
//   }

//   return rewards;
// }
export const create = internalMutation({
  args: { tournamentId: v.string(), participants: v.number(), searchDueTime: v.number(), startTime: v.number(), duration: v.number(), endDueTime: v.number(), data: v.any() },
  handler: async (ctx, { tournamentId, participants, searchDueTime, startTime, duration, endDueTime, data }) => {
    return await ctx.db.insert("battle", { status: 0, searchDueTime, startTime, tournamentId, participants, duration, endDueTime, data });
  },
});
export const findById = internalQuery({
  args: { battleId: v.id("battle") },
  handler: async (ctx, { battleId }) => {
    const battle = await ctx.db.get(battleId);
    if (battle)
      return { ...battle, id: battleId, _id: undefined, _creationTime: undefined };
  },
});
export const find = internalQuery({
  args: { battleId: v.id("battle") },
  handler: async (ctx, { battleId }) => {

    const battle = await ctx.db.get(battleId);
    const games = await ctx.db
      .query("games")
      .filter((q) => q.eq(q.field("battleId"), battleId))
      .collect();
    if (battle && games) {
      const gs: any[] = []
      for (const game of games) {
        const user = await ctx.db.get(game.uid as Id<"user">)
        gs.push({ player: { uid: game.uid, name: user?.name, avatar: user?.avatar }, uid: game.uid, gameId: game._id })
      }
      return { ...battle, id: battle._id, _id: undefined, _creationTime: undefined, games: gs }
    }
  },
});
// export const findBattle = query({
//   args: { battleId: v.id("battle") },
//   handler: async (ctx, { battleId }) => {
//     const battle = await ctx.db.get(battleId);
//     const games = await ctx.db
//       .query("games")
//       .filter((q) => q.eq(q.field("battleId"), battleId))
//       .collect();

//     if (battle && games) {
//       const timeout = (battle.startTime + battle.duration) <= Date.now() ? true : false;
//       const report: { uid: string; gameId: string; result?: any }[] = [];
//       for (const game of games) {
//         if (game.result) {
//           report.push({ uid: game.uid, gameId: game._id, result: game.result });
//         } else if (timeout) {
//           const result = GameEngine.settleGame(game);
//           report.push({ uid: game.uid, gameId: game._id, result: result });
//         } else
//           report.push({ uid: game.uid, gameId: game._id });
//       }
//       return { ...battle, id: battle._id, _id: undefined, games: report }
//     }
//   },
// });


export const settleBattle = internalMutation({
  handler: async (ctx) => {

    const battles = await ctx.db.query("battle")
      .filter((q) => q.and(q.eq(q.field("status"), BATTLE_STATUS.OPEN), q.lt(q.field("endDueTime"), Date.now()))).collect();
    console.log("size:" + battles.length)
    for (const b of battles) {
      //check if all games settled
      const games = await ctx.db
        .query("games")
        .filter((q) => q.eq(q.field("battleId"), b._id))
        .collect();
      console.log("game size:" + games.length)
      const toSettles = games.filter((g) => !g.result);
      console.log("tosettle size:" + toSettles.length)
      for (const game of toSettles) {
        const result = settleGame(game, b);
        console.log(result)
        if (result) {
          game['result'] = result;
          const score = result['base'] + result['time'] + result['goal'];
          game['score'] = score;
          await ctx.db.patch(game._id, { result, score })
        }
      }
      const battle: any = Object.assign({}, b, { id: b._id, _id: undefined, games })

      const tournament = await ctx.db.query("tournament").filter((q) => q.eq(q.field("id"), b.tournamentId)).unique();
      if (tournament) {
        const rewards = countRewards(tournament, battle);
        // for (const r of rewards) {
        //   if (r.assets) {
        //     for (const a of r.assets) {
        //       const asset = await ctx.db.query("asset")
        //         .filter((q) => q.and(q.eq(q.field("type"), a.asset), q.eq(q.field("uid"), r.uid))).unique();
        //       if (asset) {
        //         asset.amount = asset.amount + a.amount;
        //         await ctx.db.patch(asset._id, { amount: asset.amount });
        //       } else {
        //         await ctx.db.insert("asset", { uid: r.uid, type: a.asset, amount: a.amount, lastUpdate: Date.now() });
        //       }
        //     }
        //   }
        //   if (r.points) {
        //     const boardItem = await ctx.db.query("leaderboard")
        //       .filter((q) => q.and(q.eq(q.field("tournamentId"), tournament.id), q.eq(q.field("term"), tournament.currentTerm), q.eq(q.field("uid"), r.uid))).unique();
        //     if (boardItem) {
        //       await ctx.db.patch(boardItem._id, { points: boardItem.points + r.points });
        //     } else {
        //       const term = tournament.currentTerm ?? 0;
        //       await ctx.db.insert("leaderboard", { uid: r.uid, tournamentId: tournament.id, term, points: r.points, lastUpdate: Date.now() })
        //     }
        //   }
        // }
        battle['rewards'] = rewards
        battle.status = 1;
      }
      await ctx.db.patch(b._id, { status: battle.status, rewards: battle.rewards })
    }

  }
});

export const findMyBattles = sessionQuery({
  args: { uid: v.string(), to: v.number(), from: v.optional(v.number()) },
  handler: async (ctx, { uid, from, to }) => {
    console.log(from + ":" + to)
    const mybattles = [];
    let games;
    if (from)
      games = await ctx.db.query("games").filter((q) => q.and(q.lt(q.field("_creationTime"), to), q.gt(q.field("_creationTime"), from))).order("desc").collect();
    else
      games = await ctx.db.query("games").filter((q) => q.and(q.lt(q.field("_creationTime"), to))).order("desc").take(10);
    // if (from)
    //   games = await ctx.db.query("games").filter((q) => q.and(q.eq(q.field("uid"), uid), q.lt(q.field("_creationTime"), to), q.gt(q.field("_creationTime"), from))).order("desc").collect();
    // else
    //   games = await ctx.db.query("games").filter((q) => q.and(q.eq(q.field("uid"), uid), q.lt(q.field("_creationTime"), to))).order("desc").take(10);

    for (const game of games) {
      const b: any = await ctx.db.get(game.battleId as Id<"battle">);

      if (b) {
        mybattles.push({ ...b, id: b._id, _id: undefined, time: game._creationTime, _creationTime: undefined })
      }
    }
    return mybattles
  },
});
export const findReport = action({
  args: { battleId: v.string() },
  handler: async (ctx, { battleId }): Promise<any> => {
    const bid = battleId as Id<"battle">
    const battle = await ctx.runQuery(internal.battle.findById, { battleId: bid });
    if (battle) {
      const report: { player?: { uid: string, name: string, avatar: number }, uid: string; gameId: string; result?: any }[] = [];
      const games = await ctx.runQuery(internal.games.findBattleGames, { battleId: bid });
      for (const game of games) {
        const player = game.uid ? await ctx.runQuery(internal.user.find, { id: game.uid as Id<"user"> }) : undefined;
        const item: any = { uid: game.uid, gameId: game._id, score: game.score };
        if (game.result) {
          item.result = game.result;
          item.score = game.result.base + game.result.time + game.result.goal
          // report.push({ uid: game.uid, gameId: game._id, result: game.result });
        } else {
          const timeLeft = battle.startTime + battle.duration - Date.now();
          // console.log("game:" + game._id + " time left:" + timeLeft)
          if (timeLeft < 0) {
            let result = GameEngine.settleGame(game, battle);
            if (!result)
              result = { base: 0, time: 0, goal: 0 }
            item.result = result;
            item.score = result.base + result.time + result.goal;
            // report.push({ uid: game.uid, gameId: game._id, result });
            await ctx.runMutation(internal.games.update, { gameId: game._id, data: { result } })
          }
        }
        if (player) {
          item.player = {
            ...player, token: undefined, tenant: undefined, cuid: undefined
          };
        }
        report.push(item)
      }
      return report
    }
  },
});
export const findBattle = action({
  args: { battleId: v.string() },
  handler: async (ctx, { battleId }): Promise<any> => {
    const bid = battleId as Id<"battle">
    const battle = await ctx.runQuery(internal.battle.findById, { battleId: bid });
    if (battle) {
      const timeout = (battle.startTime + battle.duration) <= Date.now() ? true : false;
      const report: { player: any, uid: string; gameId: string; result?: any; data: any }[] = [];
      const games = await ctx.runQuery(internal.games.findBattleGames, { battleId: bid });
      for (const game of games) {
        const user = await ctx.runQuery(internal.user.find, { id: game.uid as Id<"user"> })
        if (!user) {
          throw new Error("player not found");
        }
        const player = Object.assign({}, user, { token: undefined, tenant: undefined })
        if (game.result) {
          report.push({ player, uid: game.uid, gameId: game._id, result: game.result, data: { matched: game.data.matched ?? [] } });
        } else if (timeout) {
          let result = GameEngine.settleGame(game, battle);
          if (!result)
            result = { base: 0, time: 0, goal: 0 }
          report.push({ player, uid: game.uid, gameId: game._id, result, data: { matched: game.data.matched ?? [] } });
          await ctx.runMutation(internal.games.update, { gameId: game._id, data: { result } })
        } else
          report.push({ player, uid: game.uid, gameId: game._id, data: { matched: game.data.matched ?? [] } })
      }
      return { ...battle, id: bid, _id: undefined, games: report }
    }
  },
});