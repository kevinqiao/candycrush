import { v } from "convex/values";
import { BATTLE_STATUS, GAME_STATUS } from "../model/Constants";
import * as GameEngine from "../service/GameEngine";
import { countRewards, settleGame } from "../service/GameEngine";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { internalMutation, internalQuery } from "./_generated/server";
import { sessionAction, sessionQuery } from "./custom/session";

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
    if (battle) {
      const diffcult = await ctx.db.query("diffcult")
        .filter((q) => q.eq(q.field("id"), battle.diffcult)).unique();
      if (!diffcult) return;
      return { ...battle, id: battleId, _id: undefined, _creationTime: undefined, data: diffcult.data };
    }
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


export const settleBattle_bak = internalMutation({
  handler: async (ctx) => {

    const battles = await ctx.db.query("battle")
      .filter((q) => q.and(q.eq(q.field("status"), BATTLE_STATUS.OPEN), q.lt(q.field("dueTime"), Date.now()))).collect();

    for (const b of battles) {
      //check if all games settled
      const games = await ctx.db
        .query("games")
        .filter((q) => q.eq(q.field("battleId"), b._id))
        .collect();

      const toSettles = games.filter((g) => !g.result);
      let settled = true;
      for (const game of toSettles) {
        const df = await ctx.db.query("diffcult")
          .filter((q) => q.eq(q.field("id"), game.diffcult)).unique();
        if (df) {
          const result = settleGame(game);
          if (result?.goal) {
            game['result'] = result;
            const score = result['base'] + result['time'] + result['goal'];
            game['score'] = score;
            await ctx.db.patch(game._id, { result, score, status: GAME_STATUS.SETTLED })
          }
        } else
          settled = false
      }
      if (settled) {
        const battle: any = Object.assign({}, b, { id: b._id, _id: undefined, games })
        const tournament = await ctx.db.query("tournament").filter((q) => q.eq(q.field("id"), b.tournamentId)).unique();
        if (tournament) {
          const rewards = countRewards(tournament, battle);
          // console.log(rewards)
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

  }
});

export const findMyBattles = sessionQuery({
  args: { to: v.optional(v.number()), from: v.optional(v.number()) },
  handler: async (ctx, { from, to }) => {

    console.log(from + ":" + to)
    const mybattles: { battleId: string; time: number; reward: any; participants: number; claim?: number }[] = [];
    if (ctx.user) {
      let games;
      const { uid } = ctx.user;
      if (!from && !to)
        games = await ctx.db.query("games").filter((q) => q.and(q.eq(q.field("uid"), uid), q.gt(q.field("status"), GAME_STATUS.SETTLED))).order("desc").take(10);
      else if (from && !to)
        games = await ctx.db.query("games").filter((q) => q.and(q.eq(q.field("uid"), uid), q.gt(q.field("status"), GAME_STATUS.SETTLED), q.gt(q.field("_creationTime"), from))).order("desc").collect();
      else if (to && !from)
        games = await ctx.db.query("games").filter((q) => q.and(q.eq(q.field("uid"), uid), q.gt(q.field("status"), GAME_STATUS.SETTLED), q.lt(q.field("_creationTime"), to))).order("desc").take(10);
      else if (from && to) {
        games = await ctx.db.query("games").filter((q) => q.and(q.eq(q.field("uid"), uid), q.gt(q.field("status"), GAME_STATUS.SETTLED), q.gt(q.field("_creationTime"), from), q.lt(q.field("_creationTime"), to))).order("desc").take(10);
      }

      if (games) {
        for (const game of games) {
          const battle = await ctx.db.get(game.battleId as Id<"battle">);
          if (battle?.rewards) {
            const claim = game.status === GAME_STATUS.REWARD_DISPATCHED ? 1 : 0;
            const reward = battle.rewards.find((r) => r.uid === uid);
            mybattles.push({ battleId: battle._id, time: game.startTime ?? battle._creationTime, reward, participants: battle.rewards.length, claim })
          }
        }
      }
    }
    return mybattles
  },
});

export const findReport = sessionAction({
  args: { battleId: v.string() },
  handler: async (ctx, { battleId }): Promise<any> => {
    const bid = battleId as Id<"battle">;

    let battle: any = await ctx.runQuery(internal.battle.find, { battleId: bid });

    if (battle) {
      const tournament = await ctx.runQuery(internal.tournaments.findById, { id: battle.tournamentId as Id<"tournament"> });
      if (tournament && battle.startTime + battle.duration <= Date.now() && !battle.rewards) {
        battle = await ctx.runMutation(internal.battle.settle, { battleId: bid, rewards: tournament.rewards })
      }

      const games: { player: { name?: string; avatar?: number }, uid: string; gameId: string; result?: any; reward?: any }[] = [];
      for (const game of battle.games) {

        const user = await ctx.runQuery(internal.user.find, { id: game.uid as Id<"user"> })
        if (!user) {
          throw new Error("player not found");
        }
        const { gameId, result, uid } = game;
        const { name, avatar } = user;
        if (battle.rewards) {
          const reward = battle.rewards.find((r: any) => r.gameId === gameId)
          games.push({ player: { name, avatar }, uid: uid, gameId, result, reward: { ...reward, gameId: undefined } });
        } else
          games.push({
            player: { name, avatar }, uid: uid, gameId, result
          })
      }
      return { ...battle, id: bid, _id: undefined, _creationTime: undefined, games, rewards: undefined }
    }
  },
});

export const settle = internalMutation({
  args: { battleId: v.id("battle"), rewards: v.array(v.object({ rank: v.number(), assets: v.array(v.object({ asset: v.number(), amount: v.number() })) })) },
  handler: async (ctx, { battleId, rewards }) => {
    const battle = await ctx.db.get(battleId);
    if (battle && battle.diffcult) {
      // const diffcult = await ctx.db.query("diffcult").filter((q) => q.eq(q.field("id"), battle.diffcult)).unique()
      const timeout = (battle.startTime + battle.duration) <= Date.now() ? 1 : 0;
      if (!battle.rewards && timeout) {
        const games = await ctx.db
          .query("games")
          .filter((q) => q.eq(q.field("battleId"), battleId))
          .collect();

        const settledGames: { uid: string; gameId: string; reward?: any; result: any; score: number }[] = []
        for (const game of games) {
          if (!game.result) {
            GameEngine.settleGame(game);
            await ctx.db.patch(game._id, { result: game.result, score: game.score, status: GAME_STATUS.REWARD });
          } else
            await ctx.db.patch(game._id, { status: GAME_STATUS.REWARD });
          settledGames.push({ uid: game.uid, gameId: game._id, result: game.result, score: game.score ?? 0 })
        }

        const settledRewards: { uid: string; gameId: string; rank: number, score: number, assets: { asset: number; amount: number }[] }[] = [];
        settledGames.sort((a: any, b: any) => b.score - a.score).forEach((r: any, index: number) => {
          const reward = rewards.find((w) => w.rank === index);
          if (reward) {
            settledRewards.push({ uid: r.uid, gameId: r.gameId, rank: index, score: r.score, assets: reward.assets });
          } else
            settledRewards.push({ uid: r.uid, gameId: r.gameId, rank: index, score: r.score, assets: [] });
        })
        await ctx.db.patch(battleId, { rewards: settledRewards, status: 1 })
        return { ...battle, games: settledGames, rewards: settledRewards };
      }
    }
  },
});
export const claim = sessionAction({
  args: { gameId: v.string() },
  handler: async (ctx, { gameId }): Promise<any> => {
    if (ctx.user) {
      await ctx.runMutation(internal.games.update, { gameId: gameId as Id<"games">, data: { status: GAME_STATUS.REWARD_DISPATCHED } })
      return { ok: true }
    }
  },
});
export const findBattle = sessionAction({
  args: { battleId: v.string() },
  handler: async (ctx, { battleId }): Promise<any> => {
    const bid = battleId as Id<"battle">;
    let battle: any = await ctx.runQuery(internal.battle.find, { battleId: bid });
    if (battle) {
      const tournament = await ctx.runQuery(internal.tournaments.findById, { id: battle.tournamentId });
      if (!tournament) throw new Error("tournament not found");
      const timeout = (battle.startTime + battle.duration) <= Date.now() ? 1 : 0;
      if (!battle.rewards && timeout) {
        battle = await ctx.runMutation(internal.battle.settle, { battleId: bid, rewards: tournament.rewards })
      }
      if (tournament.type === 1 && tournament.participants === 2) {
        const game = battle.games.find((game: any) => game.uid === ctx.user.cuid);
        battle.games = [game];
      }
      const games: { player: { name: string; avatar: number }; uid: string; gameId: string; reward: any; result: any }[] = []
      for (const game of battle.games) {
        const user = await ctx.runQuery(internal.user.find, { id: game.uid as Id<"user"> })
        if (!user) {
          throw new Error("player not found");
        }
        const { name, avatar } = user;
        const { uid, result, reward, gameId } = game;
        games.push({ player: { name: name ?? "", avatar: avatar ?? 0 }, gameId, result, uid, reward });
      }
      battle.games = games;
      const rewards: { player: { name?: string; avatar?: number }, uid: string; gameId: string; result?: { base: number; time: number; goal: number }; assets: { asset: number; amount: number } }[] = [];
      if (battle.rewards) {
        for (const reward of battle.rewards) {
          const user = await ctx.runQuery(internal.user.find, { id: reward.uid as Id<"user"> })
          if (!user) {
            throw new Error("player not found");
          }
          const { name, avatar } = user;
          rewards.push({ ...reward, player: { name, avatar } });
        }
      }
      return { ...battle, id: bid, _id: undefined, _creationTime: undefined, rewards: rewards.length > 0 ? rewards : undefined }
    }
  },
});
