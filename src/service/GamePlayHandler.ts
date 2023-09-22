import { useQuery } from "convex/react";
import { MutableRefObject, useCallback, useEffect } from "react";
import { api } from "../convex/_generated/api";
import { GameModel } from "../model/GameModel";
import useEventSubscriber from "./EventManager";
import * as gameEngine from "./GameEngine";

const useGamePlayHandler = (gameRef: MutableRefObject<GameModel | null>, active: boolean) => {
  const { createEvent } = useEventSubscriber([], []);
  const gameEvent: any = useQuery(api.events.getByGame, { gameId: gameRef.current?.gameId ?? "0000" });


  const processMatchSolved = useCallback((data: any) => {

    if (!gameRef.current) return;
    for (let res of data) {
      const id = res.id;
      gameRef.current.cells = gameEngine.applyMatches(gameRef.current.cells, res);
      gameRef.current.cells.sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row;
        else return a.column - b.column;
      });
      // console.log(JSON.parse(JSON.stringify(gameRef.current)))
      createEvent({
        name: "matchSolved",
        data: res,
        topic: "animation",
        delay: (id - 1) * 200,
      })
    }
  }, [gameRef, createEvent])

  const processSwapped = useCallback((data: any) => {
    const game = gameRef.current;
    if (!game) return;

    if (data.candy) {
      const candy = game.cells.find((c) => c.id === data.candy.id);
      if (candy)
        Object.assign(candy, data.candy);
    }
    if (data.target) {
      const target = game.cells.find((c) => c.id === data.target.id);
      if (target)
        Object.assign(target, data.target);
    }
    if (data) {
      createEvent({
        name: "candySwapped",
        data: data,
        topic: "animation",
        delay: 20,
      });
    }
  }, [gameRef, createEvent])

  useEffect(() => {
    if (gameEvent && active) {

      const name = gameEvent.name;
      switch (name) {
        case "matchSolved":
          processMatchSolved(gameEvent.data)
          break;
        case "cellSwapped":
          processSwapped(gameEvent.data)
          break;
        default:
          break;
      }
    }

  }, [gameEvent]);


}
export default useGamePlayHandler