import { useConvex } from "convex/react";
import React, { useEffect, useState } from "react";
import { useUserManager } from "service/UserManager";
import { api } from "../../convex/_generated/api";
import PageProps from "../../model/PageProps";

const LeaderBoardHome: React.FC<PageProps> = (pageProp) => {
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const convex = useConvex();
  const { user } = useUserManager();

  useEffect(() => {
    const findBoard = async (tournamentId: string, term: number) => {
      if (user) {
        const { uid, token } = user;
        const board = await convex.query(api.leaderboard.findByTournament, {
          tournamentId,
          uid,
          token,
          term,
        });
        setLeaderboard(board);
      }
    };
    if (pageProp.data.tournament) {
      const { id, currentTerm } = pageProp.data.tournament;
      findBoard(id, currentTerm);
    }
  }, [pageProp, user]);

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
          height: 90,
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
          height: "70%",
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
          {leaderboard?.leaders.map((leader: any, index: number) => (
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
        <span>{leaderboard?.rank}</span>
      </div>
    </div>
  );
};

export default LeaderBoardHome;
