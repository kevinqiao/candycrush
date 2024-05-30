import { v } from "convex/values";
import { GAME_STATUS } from "../model/Constants";
import * as GameEngine from "../service/GameEngine";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { internalMutation, internalQuery } from "./_generated/server";
import { sessionAction, sessionMutation } from "./custom/session";
export interface Leaderboard {
  _creationTime: undefined;
  _id: undefined;
  tournamentId: string;
  term?: number;
  uid: string;
  score: number;
  lastUpdate: number;
  reward?: { asset: number; amount: number }[];
  collected?: number;//0-to collect 1-collected
}
export const create = internalMutation({
  args: { tournamentId: v.string(), participants: v.number(), startTime: v.number(), duration: v.number(), dueTime: v.number(), diffcult: v.string() },
  handler: async (ctx, { tournamentId, participants, startTime, duration, dueTime, diffcult }) => {
    return await ctx.db.insert("battle", { status: 0, startTime, tournamentId, participants, duration, dueTime, diffcult });
  },
});
export const findById = internalQuery({
  args: { battleId: v.id("battle") },
  handler: async (ctx, { battleId }) => {
    const battle = await ctx.db.get(battleId);
    return battle
    // if (battle) {
    //   const diffcult = await ctx.db.query("diffcult")
    //     .filter((q) => q.eq(q.field("id"), battle.diffcult)).unique();
    //   if (!diffcult) return;
    //   return { ...battle, id: battleId, _id: undefined, _creationTime: undefined, data: diffcult.data };
    // }
  },
});
export const find = internalQuery({
  args: { battleId: v.id("battle") },
  handler: async (ctx, { battleId }) => {
    const battle = await ctx.db.get(battleId);
    if (battle && battle.diffcult) {
      const diffcult = await ctx.db.query("diffcult")
        .filter((q) => q.eq(q.field("id"), battle.diffcult)).unique();
      if (!diffcult) return;
      const games = await ctx.db
        .query("games")
        .filter((q) => q.eq(q.field("battleId"), battleId))
        .collect();
      const gameModels = games.map((game) => {
        if (game) return { ...game, gameId: game._id, _id: undefined, _creationTime: undefined };
      })

      return { ...battle, games: gameModels, id: battleId, _id: undefined, _creationTime: undefined, data: diffcult.data }
    }
  },
});


export const findMyBattles = sessionMutation({
  args: { to: v.optional(v.number()), from: v.optional(v.number()) },
  handler: async (ctx, { from, to }) => {

    const mybattles: { battleId?: string; leaderboard?: Leaderboard, time: number; reward?: any; participants: number; status: number }[] = [];
    if (ctx.user) {
      let games: any[] = [];
      const { uid } = ctx.user;
      if (!from && !to)
        games = await ctx.db.query("games").withIndex("by_user_type", (q) => q.eq("uid", uid).eq("type", 0)).filter((q) => q.eq(q.field("status"), GAME_STATUS.SETTLED)).order("desc").take(20);
      else if (from && !to)
        games = await ctx.db.query("games").withIndex("by_user_type", (q) => q.eq("uid", uid).eq("type", 0)).filter((q) => q.and(q.eq(q.field("status"), GAME_STATUS.SETTLED), q.gt(q.field("_creationTime"), from))).order("desc").take(20);
      else if (to && !from)
        games = await ctx.db.query("games").withIndex("by_user_type", (q) => q.eq("uid", uid).eq("type", 0)).filter((q) => q.and(q.eq(q.field("status"), GAME_STATUS.SETTLED), q.lt(q.field("_creationTime"), to))).order("desc").take(20);
      else if (from && to) {
        games = await ctx.db.query("games").withIndex("by_user_type", (q) => q.eq("uid", uid).eq("type", 0)).filter((q) => q.and(q.eq(q.field("status"), GAME_STATUS.SETTLED), q.gt(q.field("_creationTime"), from), q.lt(q.field("_creationTime"), to))).order("desc").take(20);
      }

      if (games) {
        for (const game of games) {
          const battle = await ctx.db.get(game.battleId as Id<"battle">);
          if (!battle) continue;
          if (battle.rewards) {
            const reward = battle.rewards.find((r) => r.uid === uid);
            mybattles.push({ battleId: battle._id, time: game.startTime ?? battle._creationTime, reward, participants: battle.rewards.length, status: 1 })
          } else
            mybattles.push({ battleId: battle._id, time: game.startTime ?? battle._creationTime, participants: battle.participants, status: 0 })
        }
        const tournaments = await ctx.db.query("tournament").filter((q) => q.gt(q.field("type"), 0)).collect();
        games?.sort((a, b) => b._creationTime - a._creationTime);
        let leaderboards: any[] = [];
        if (games.length > 0) {
          const start = games[0]._creationTime;
          const end = games[games.length - 1]._creationTime;
          leaderboards = await ctx.db.query("leaderboard").withIndex("by_user", (q) => q.eq("uid", uid)).filter((q) => q.and(q.gte(q.field("_creationTime"), start), q.lte(q.field("_creationTime"), end))).order("desc").collect();
        } else {
          leaderboards = await ctx.db.query("leaderboard").withIndex("by_user", (q) => q.eq("uid", uid)).order("desc").take(20);
        }

        for (const leaderboard of leaderboards) {
          const tournament = tournaments.find((t) => t.id === leaderboard.tournamentId);
          if (!tournament) continue;

          if (!leaderboard.rank) {
            const { tournamentId, term, score } = leaderboard;
            const ranks = await ctx.db
              .query("leaderboard").withIndex("by_tournament_term_score", (q) => q.eq("tournamentId", tournamentId).eq("term", term).gte("score", score)).order("desc").collect();
            leaderboard.rank = ranks.length;
            await ctx.db.patch(leaderboard._id, { rank: leaderboard.rank })
          }
          if (tournament?.currentTerm === leaderboard.term) {
            mybattles.push({ battleId: leaderboard._id, time: leaderboard._creationTime, leaderboard: { ...leaderboard, _creationTime: undefined, _id: undefined }, participants: -1, status: tournament.settled ?? 0 })
          } else
            mybattles.push({ battleId: leaderboard._id, time: leaderboard._creationTime, leaderboard: { ...leaderboard, _creationTime: undefined, _id: undefined }, participants: -1, status: 1 })
        }
      }
      return mybattles
    }
  },
});

export const findReport = sessionAction({
  args: { battleId: v.string() },
  handler: async (ctx, { battleId }): Promise<any> => {
    const bid = battleId as Id<"battle">;
    let battle: any = await ctx.runQuery(internal.battle.find, { battleId: bid });
    const res: any = { id: bid, toCollect: 0 };
    if (battle) {
      // const tournament = await ctx.runQuery(internal.tournaments.findById, { id: battle.tournamentId as Id<"tournament"> });

      const settledBattle = await ctx.runMutation(internal.battle.settle, { battleId: bid });
      if (settledBattle)
        battle = settledBattle
      if (battle.leaderboards) {
        res.leaderboards = battle.leaderboards;
      }
      const reports: { player?: { name: string; avatar: number }; uid: string; gameId: string; score?: number; rank?: number; points?: number; assets?: { asset: number; amount: number }[] }[] = [];
      if (battle.rewards && battle.rewards.length > 0) {
        for (const reward of battle.rewards) {
          const gameReport: any = { ...reward }
          if (reward.uid) {
            const player = await ctx.runQuery(internal.user.find, { id: reward.uid as Id<"user"> });
            if (player) {
              gameReport['player'] = { name: player.name, avatar: player.avatar };
            }
          }
          reports.push(gameReport)
        }
        const myreward = battle.rewards.find((g: any) => g.uid === ctx.user.uid);
        if (!myreward.collected) {
          res.toCollect = 1
        }
      } else {
        for (const game of battle.games) {
          const gameReport: any = { gameId: game.gameId, score: game.score }
          if (game.uid) {
            const player = await ctx.runQuery(internal.user.find, { id: game.uid as Id<"user"> });
            if (player) {
              gameReport['player'] = { name: player.name, avatar: player.avatar };
              gameReport['uid'] = player.uid;
              gameReport['gameId'] = game.gameId;
            }
          }
          reports.push(gameReport)
        }
      }
      return { ...res, games: reports }
    }
  },
});

export const settle = internalMutation({
  args: { battleId: v.id("battle") },
  handler: async (ctx, { battleId }) => {
    const battle = await ctx.db.get(battleId);
    const result: any = {};
    if (battle && !battle.rewards) {
      const tournament = await ctx.db.query("tournament").filter((q) => q.eq(q.field("id"), battle.tournamentId)).order("asc").first();
      if (!tournament) return;
      const timeout = (battle.startTime + battle.duration) <= Date.now() ? 1 : 0;
      const games = await ctx.db
        .query("games")
        .filter((q) => q.eq(q.field("battleId"), battleId))
        .collect();
      if (timeout || games.every((game) => game.result)) {
        const settledGames: { uid: string; gameId: string; reward?: any; result: any; score: number; status: number }[] = []
        for (const game of games) {
          if (!game.result) {
            GameEngine.settleGame(game);
            await ctx.db.patch(game._id, { result: game.result, score: game.score, status: GAME_STATUS.SETTLED });
          } else
            await ctx.db.patch(game._id, { status: GAME_STATUS.SETTLED });
          settledGames.push({ uid: game.uid, gameId: game._id, result: game.result, score: game.score ?? 0, status: GAME_STATUS.SETTLED })
        }
        result.games = settledGames;

        if (tournament.type === 0) {
          const settledRewards: { uid: string; gameId: string; rank: number, score: number, assets: { asset: number; amount: number }[] }[] = [];
          settledGames.sort((a: any, b: any) => b.score - a.score).forEach((r: any, index: number) => {
            const reward = tournament.rewards.find((w) => w.rank === index);
            if (reward) {
              settledRewards.push({ uid: r.uid, gameId: r.gameId, rank: index + 1, score: r.score, assets: reward.assets });
            } else
              settledRewards.push({ uid: r.uid, gameId: r.gameId, rank: index + 1, score: r.score, assets: [] });
          })
          result.rewards = settledRewards;
        } else if (tournament.type === 1 || tournament.type === 2) {
          const leaderboards: { type: number; score?: number; rank: number; uid: string }[] = [];
          const rewardPoints: { uid: string; point: number; gameId: string }[] = []
          const battleReward = tournament.battle.reward;
          if (tournament.type === 1 && battleReward) {
            if (battleReward && settledGames[1]['score'] > settledGames[0]['score']) {
              rewardPoints.push({ uid: settledGames[0].uid, point: battleReward['fail'], gameId: settledGames[0].gameId });
              rewardPoints.push({ uid: settledGames[1].uid, point: battleReward['win'], gameId: settledGames[1].gameId });
            } else if (battleReward && settledGames[1]['score'] < settledGames[0]['score']) {
              rewardPoints.push({ uid: settledGames[1].uid, point: battleReward['fail'], gameId: settledGames[1].gameId });
              rewardPoints.push({ uid: settledGames[0].uid, point: battleReward['win'], gameId: settledGames[0].gameId });
            } else {
              rewardPoints.push({ uid: settledGames[1].uid, point: battleReward['draw'], gameId: settledGames[1].gameId });
              rewardPoints.push({ uid: settledGames[0].uid, point: battleReward['draw'], gameId: settledGames[0].gameId });
            }
          }
          for (let i = 0; i < settledGames.length; i++) {
            const uid = settledGames[i].uid;
            let score = settledGames[i]['score'];
            const board: { type: number; score: number; rank: number; uid: string } = { type: tournament.type, rank: -1, score: 0, uid }
            if (tournament.type === 1) {
              const reward = rewardPoints.find((r) => r.uid === uid);
              if (reward)
                score = reward.point;
            }
            const leaderboard = await ctx.db
              .query("leaderboard").withIndex("by_tournament_term_uid", (q) => q.eq("tournamentId", tournament.id).eq("term", tournament.currentTerm).eq("uid", uid)).unique();
            if (leaderboard) {
              console.log("score pre:" + score + " lead score:" + leaderboard.score);
              score = tournament.type === 1 ? leaderboard.score + score : Math.max(score, leaderboard.score);
              await ctx.db.patch(leaderboard._id, { score, lastUpdate: Date.now() })
            } else {
              await ctx.db.insert("leaderboard", { tournamentId: tournament.id, uid, score, term: tournament.currentTerm, lastUpdate: Date.now() });
            }
            const ranks = await ctx.db
              .query("leaderboard").withIndex("by_tournament_term_score", (q) => q.eq("tournamentId", tournament.id).eq("term", tournament.currentTerm).gt("score", score)).order("desc").collect();
            board.rank = ranks.length + 1;
            board.score = score;
            leaderboards.push(board)
          }
          result.leaderboards = leaderboards;
        }
        await ctx.db.patch(battleId, { rewards: result.rewards, leaderboards: result.leaderboards, status: 1 })
        return { ...battle, ...result };
      }
    }
  },
});
export const claim = sessionAction({
  args: { gameId: v.string() },
  handler: async (ctx, { gameId }): Promise<any> => {
    if (ctx.user) {
      await ctx.runMutation(internal.games.update, { gameId: gameId as Id<"games">, data: { status: GAME_STATUS.CLAIMED } })
      return { ok: true }
    }
  },
});

export const collect = internalMutation({
  args: { uid: v.string(), battleId: v.id("battle") },
  handler: async (ctx, { uid, battleId }) => {
    const battle = await ctx.db.get(battleId);
    if (battle?.rewards) {
      const reward = battle.rewards.find((r) => r.uid === uid);
      if (reward && reward.uid === uid && !reward.collected) {
        reward.collected = 1;
        await ctx.db.patch(battleId, { rewards: battle.rewards });
      }
    }
  },
})

export const findBattle = sessionAction({
  args: { battleId: v.string() },
  handler: async (ctx, { battleId }): Promise<any> => {
    const bid = battleId as Id<"battle">;
    let battle: any = await ctx.runQuery(internal.battle.find, { battleId: bid });
    if (battle) {
      const tournament = await ctx.runQuery(internal.tournaments.findById, { id: battle.tournamentId });
      if (!tournament) throw new Error("tournament not found");
      const settledBattle = await ctx.runMutation(internal.battle.settle, { battleId: bid });
      if (settledBattle)
        battle = settledBattle

      const players: { uid: string; name?: string; avatar?: number; gameId: string }[] = [];
      for (const game of battle.games) {
        const player = await ctx.runQuery(internal.user.find, { id: game.uid as Id<"user"> });
        if (player && player.uid) {
          const { uid, name, avatar } = player
          players.push({ uid, name, avatar, gameId: game.gameId })
        }
      }
      battle.players = players;
      if (tournament.battle.players !== 2) {
        const game = battle.games.find((game: any) => game.uid === ctx.user.uid);
        battle.games = [game];
      }
      return { ...battle, id: bid, _id: undefined, _creationTime: undefined }
    }
  },
});
