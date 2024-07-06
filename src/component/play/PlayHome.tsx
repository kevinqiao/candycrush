import React, { useRef } from "react";
import BattleProvider, { useBattleManager } from "service/BattleManager";
import GameProvider from "service/GameManager";
import useDimension from "util/useDimension";
import PageProps from "../../model/PageProps";
import BattleGround from "./BattleGround";
import BattleScene from "./BattleScene";
import BattleConsole from "./console/BattleConsole";
import GamePlay from "./GamePlay";
import BattleReady from "./match/BattleReady";
import "./play.css";
import BattleReport from "./report/BattleReport";
import GameReport from "./report/GameReport";

const PlayControl: React.FC = () => {
  const { battle } = useBattleManager();
  return (
    <>
      {battle &&
        battle.games &&
        battle.games.map((g) => (
          <GameProvider key={g.gameId} gameId={g.gameId}>
            <GamePlay />
          </GameProvider>
        ))}
    </>
  );
};

const PlayHome: React.FC<PageProps> = (pageProp) => {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const pagePosition = useDimension(sceneRef);

  return (
    <>
      {/* <StyleSheetManager shouldForwardProp={(propName) => isPropValid(propName)}> */}
      <div ref={sceneRef} className="play_container">
        <BattleProvider pageProp={pageProp} pagePosition={pagePosition}>
          <BattleGround>
            <BattleConsole />
            <PlayControl />
            <BattleScene />
          </BattleGround>
          <GameReport />
          <BattleReport />
          <BattleReady />
        </BattleProvider>
      </div>
      {/* </StyleSheetManager> */}
    </>
  );
};
export default PlayHome;
