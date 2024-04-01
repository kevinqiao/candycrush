import BattleGround from "component/play/BattleGround";
import BattleScene from "component/play/BattleScene";
import GamePlay from "component/play/GamePlay";
import GameConsole from "component/play/console/GameConsole";
import TimeCount from "component/play/console/TimeCount";
import { Id } from "convex/_generated/dataModel";
import { BattleModel } from "model/Battle";
import { BATTLE_LOAD } from "model/Constants";
import PageProps from "model/PageProps";
import React, { useEffect, useRef, useState } from "react";
import BattleProvider from "service/BattleManager";
import GameProvider from "service/GameManager";
import SceneProvider from "service/SceneManager";
import useTournamentManager from "service/TournamentManager";
import useDimension from "util/useDimension";
interface ControlProps {
  battleId: string;
  gameId: string;
}
const RePlayControl: React.FC<ControlProps> = ({ battleId, gameId }) => {
  const [battle, setBattle] = useState<BattleModel | null>(null);
  const { findBattle } = useTournamentManager();

  useEffect(() => {
    if (!battle && battleId) {
      findBattle(battleId as Id<"battle">).then((b) => {
        // sbattleRef.current = b;
        setBattle(b);
      });
    }
  }, [battleId]);
  return (
    <>
      {battle ? (
        <BattleProvider battle={battle}>
          <BattleGround>
            <TimeCount />
            <GameConsole gameId={gameId} />
            <GameProvider gameId={gameId}>
              <GamePlay />
            </GameProvider>
            <BattleScene />
          </BattleGround>
        </BattleProvider>
      ) : null}
    </>
  );
};
const ReplayHome: React.FC<PageProps> = (pageProp) => {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const pagePosition = useDimension(sceneRef);
  const { battleId, gameId } = pageProp.data;
  return (
    <div
      ref={sceneRef}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "blue",
      }}
    >
      <SceneProvider load={BATTLE_LOAD.REPLAY} pageProp={pageProp} pagePosition={pagePosition}>
        {battleId ? <RePlayControl battleId={battleId} gameId={gameId} /> : null}
      </SceneProvider>
    </div>
  );
};

export default ReplayHome;
