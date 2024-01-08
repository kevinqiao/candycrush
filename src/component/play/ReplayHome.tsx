import { useEffect, useState } from "react";
import BattleModel from "../../model/Battle";
import PageProps from "../../model/PageProps";
import BattleProvider from "../../service/BattleManager";
import GameProvider from "../../service/GameManager";
import SceneProvider from "../../service/SceneManager";
import { AnimateProvider } from "../animation/AnimateManager";
import usePageVisibility from "../common/usePageVisibility";
import BattleGround from "./BattleGround";
import BattleScene from "./BattleScene";
import GamePlay from "./GamePlay";
import BattleConsole from "./console/BattleConsole";

const ReplayHome: React.FC<PageProps> = (pageProp) => {
  const [battle, setBattle] = useState<BattleModel | null>(null);

  const browserVisible = usePageVisibility();
  const [rerender, setRerender] = useState(browserVisible);

  useEffect(() => {
    if (!browserVisible) {
      if (battle) {
        if (!battle.status) {
          battle.load = 2;
          setRerender(false);
        }
      }
    } else setRerender(true);
  }, [browserVisible, battle]);

  return (
    <div
      style={{
        position: "relative",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "transparent",
      }}
    >
      <BattleProvider battle={battle}>
        <SceneProvider pageProp={pageProp}>
          <AnimateProvider>
            {rerender && battle ? (
              <>
                <BattleGround>
                  <BattleConsole />
                  {battle.games.map((g) => (
                    <GameProvider key={g.gameId} game={g}>
                      <GamePlay game={g} />
                    </GameProvider>
                  ))}
                  <BattleScene />
                </BattleGround>
              </>
            ) : null}
          </AnimateProvider>
        </SceneProvider>
      </BattleProvider>
    </div>
  );
};

export default ReplayHome;
