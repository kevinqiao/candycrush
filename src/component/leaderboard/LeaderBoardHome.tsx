import { useConvex } from "convex/react";
import React, { useEffect, useMemo, useState } from "react";
import { useUserManager } from "service/UserManager";
import { api } from "../../convex/_generated/api";
import PageProps from "../../model/PageProps";
interface LeaderboardReport {
  rank: number;
  participants: number;
  time: number;
  leaderboards?: [];
}
const LeaderBoardHome: React.FC<PageProps> = (pageProp) => {
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [battleReport, setBattleReport] = useState<any>(null);
  const convex = useConvex();
  const { user } = useUserManager();

  useEffect(() => {
    const findBattle = async (battleId: string) => {
      if (user) {
        const { uid, token } = user;
        const report = await convex.action(api.battle.findReport, {
          battleId,
          uid,
          token,
        });
        console.log(report);
        setBattleReport(report);
      }
    };
    const findLeaderBoard = async (tournamentId: string, term: number) => {
      if (user) {
        const { uid, token } = user;
        const board = await convex.query(api.leaderboard.findByTournament, {
          tournamentId,
          uid,
          token,
          term,
        });
        console.log(board);
        setLeaderboard(board);
      }
    };
    if (pageProp.data.tournament) {
      const { id, term } = pageProp.data.tournament;
      findLeaderBoard(id, term);
    } else if (pageProp.data.battleId) {
      findBattle(pageProp.data.battleId);
    }
  }, [pageProp, user]);
  const myrank = useMemo(() => {
    if (!user) return null;
    if (leaderboard) {
      return leaderboard.rank;
    } else if (battleReport?.games) {
      const game = battleReport.games.find((g: any) => g.uid === user.uid);
      return game.rank;
    }
    return null;
  }, [user, leaderboard, battleReport]);
  const myreward = useMemo(() => {
    if (!user) return null;
    if (leaderboard) {
      console.log(leaderboard);
      return { collected: leaderboard.collected, assets: leaderboard.reward };
    } else if (battleReport?.games) {
      const game = battleReport.games.find((g: any) => g.uid === user.uid);
      return { collected: game.collected, assets: game.assets };
    }
  }, [user, leaderboard, battleReport]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 18,
        backgroundColor: "white",
      }}
      onClick={() => console.log(pageProp)}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "20%",
          maxHeight: 120,
          minHeight: 60,
          width: "100%",
          color: "blue",
        }}
      >
        <span style={{ fontSize: 25 }}>Leaderboard</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "60%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            height: "100%",
            width: "80%",
            color: "blue",
          }}
        >
          {leaderboard?.leadboards.map((leader: any, index: number) => (
            <div
              key={leader.player.uid}
              style={{ display: "flex", justifyContent: "space-between", width: "100%", height: 50 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "15%",
                  maxWidth: 80,
                  height: "100%",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "90%",
                    backgroundImage: `url("avatars/${leader.player.avatar}.svg")`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                  }}
                ></div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "55%" }}>
                {leader.player.name}
              </div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "20%" }}>
                {leader.score}
              </div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "15%" }}>
                {leader.rank}
              </div>
            </div>
          ))}
          {battleReport?.games.map((game: any, index: number) => (
            <div
              key={game.gameId}
              style={{ display: "flex", justifyContent: "space-between", width: "100%", height: 50 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "15%",
                  maxWidth: 80,
                  height: "100%",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "90%",
                    backgroundImage: `url("avatars/${game.player.avatar}.svg")`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                  }}
                ></div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "55%" }}>
                {game.player.name}
              </div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "20%" }}>
                {game.score}
              </div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "15%" }}>
                {game.rank}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 90,
          width: "100%",
          color: "blue",
          fontSize: 15,
        }}
      >
        <span>My Rank:</span>
        <span>{myrank}</span>
      </div>
      {!myreward?.collected ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 40,
            width: "100%",
            fontSize: 15,
          }}
        >
          <div
            style={{
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "60%",
              height: "100%",
              maxWidth: 300,
              borderRadius: 4,
              backgroundColor: "blue",
              color: "white",
            }}
          >
            Claim
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default LeaderBoardHome;
