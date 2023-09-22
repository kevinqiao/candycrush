import { useAction, useConvex } from "convex/react";
import { useCallback, useEffect, useRef } from "react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { CellItem } from "../model/CellItem";
import { GameModel } from "../model/GameModel";
import { MatchModel } from "../model/MatchModel";
import useEventSubscriber from "./EventManager";
import * as gameEngine from "./GameEngine";
import useGameEventHandler from "./GamePlayHandler";
import useGameReplay from "./GameReplayHandler";

//type: 0-solo 1-sync 2-turn 3-replay
const useGameManager = ({ gameId, playMode }: { gameId: string | null; playMode: number }) => {
  const { createEvent } = useEventSubscriber(["sync"], ["game"]);
  const convex = useConvex();
  const swap = useAction(api.gameService.swipeCell);
  const gameRef = useRef<GameModel | null>(null);
  useGameEventHandler(gameRef, playMode === 1 ? false : true);
  useGameReplay(gameRef, playMode === 1 ? true : false);


  useEffect(() => {

    const init = async () => {
      const g: GameModel | null = await convex.query(api.games.findInitGame, {
        gameId: gameId as Id<"games">,
      });
      console.log(g)
      if (g) {
        gameRef.current = g;
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
  }, [gameId, convex, gameRef, createEvent]);

  const swapCell = useCallback(
    async (candyId: number, targetId: number, cells: CellItem[]) => {
      if (cells) {
        const candies = JSON.parse(JSON.stringify(cells));
        const candy = candies.find((c: CellItem) => c.id === candyId);
        const target = candies.find((c: CellItem) => c.id === targetId);
        [candy.row, target.row] = [target.row, candy.row];
        [candy.column, target.column] = [target.column, candy.column];

        const matches: MatchModel[] | undefined = gameEngine.getMatches(candies);
        if (matches && matches.length > 0) {
          let results = gameEngine.processMatches(candies, matches);
          if (gameRef.current) {
            swap({ gameId: gameRef.current.gameId as Id<"games">, candyId: candyId, targetId: targetId });
          }
          return results;
        }
      }
    },
    [swap]
  );

  return { game: gameRef.current, swapCell };
};
export default useGameManager;
