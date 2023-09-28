import { useAction, useConvex } from "convex/react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { CellItem } from "../model/CellItem";
import { GameModel } from "../model/GameModel";
import { MatchModel } from "../model/MatchModel";
import useEventSubscriber from "./EventManager";
import * as gameEngine from "./GameEngine";
import useGamePlayHandler from "./GamePlayHandler";

//type: 0-solo 1-sync 2-turn 3-replay
const useGameManager = ({ battleId, gameId, isReplay }: { battleId: string | undefined; gameId: string | null; isReplay: boolean }) => {
  const { createEvent } = useEventSubscriber(["sync"], ["game"]);

  const convex = useConvex();
  const swap = useAction(api.gameService.swipeCell);
  // const gameRef = useRef<GameModel | null>(null);
  const [game, setGame] = useState<GameModel | null>(null)
  useGamePlayHandler(battleId, game, isReplay);



  useEffect(() => {
    console.log("gameId:" + gameId)
    const init = async () => {
      const g: GameModel | null = await convex.query(api.games.findInitGame, {
        gameId: gameId as Id<"games">,
      });
      console.log(g)
      if (g) {
        // gameRef.current = g;
        setGame(g)
        createEvent({
          name: "gameInited",
          data: g.cells,
          topic: "animation",
          delay: 20,
        });
      }
    };
    if (gameId) {
      init()
    }

    //   // if (event?.name === "candiesCreated") checkMatch();
  }, [gameId, convex, createEvent]);

  const swapCell = useCallback(
    async (candyId: number, targetId: number, cells: CellItem[]) => {
      console.log("battle:" + battleId)
      console.log(cells)
      if (battleId && cells) {
        const candies = JSON.parse(JSON.stringify(cells));
        const candy = candies.find((c: CellItem) => c.id === candyId);
        const target = candies.find((c: CellItem) => c.id === targetId);
        [candy.row, target.row] = [target.row, candy.row];
        [candy.column, target.column] = [target.column, candy.column];

        const matches: MatchModel[] | undefined = gameEngine.getMatches(candies);
        if (matches && matches.length > 0) {
          let results = gameEngine.processMatches(candies, matches);
          if (game) {
            swap({ gameId: game.gameId as Id<"games">, candyId: candyId, targetId: targetId });
          }
          return results;
        }
      }
    },
    [game, swap, battleId]
  );

  return { game, swapCell };
};
export default useGameManager;
