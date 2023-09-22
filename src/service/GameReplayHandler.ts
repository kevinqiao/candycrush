import { useConvex } from "convex/react";
import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { GameModel } from "../model/GameModel";
import useEventSubscriber from "./EventManager";
import * as gameEngine from "./GameEngine";
const sleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
const useGameReplayHandler = (gameRef: MutableRefObject<GameModel | null>, active: boolean) => {
  const [startTime, setStartTime] = useState<number>(Date.now());
  const { event, createEvent } = useEventSubscriber(["load"], ["game"]);
  const gameEventsRef = useRef<any[] | null | undefined>();
  const convex = useConvex();

  const processMatchSolved = useCallback((data: any) => {

    if (!gameRef.current) return;
    for (let res of data) {
      const id = res.id;
      gameRef.current.cells = gameEngine.applyMatches(gameRef.current.cells, res);
      gameRef.current.cells.sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row;
        else return a.column - b.column;
      });

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
    const load = async (gameId: string) => {
      const events = await convex.query(api.events.findAllByGame, {
        gameId: gameId as Id<"games">,
      });
      console.log(events)
      gameEventsRef.current = events;
      setStartTime(Date.now());
    };
    if (gameRef.current?.gameId) {
      console.log("loading all events for gameId:" + gameRef.current.gameId)
      load(gameRef.current.gameId)
    }

  }, [gameRef.current]);

  useEffect(() => {
    const timer = setInterval(() => {

      if (active && gameEventsRef.current && gameEventsRef.current.length > 0) {
        const gameEvents = gameEventsRef.current;

        const csteptime = Date.now() - startTime;
        const allpast = gameEvents.filter((c) => !c.status && c.steptime && c.steptime < csteptime).sort((a, b) => {
          if (a.steptime && b.steptime)
            return a.steptime - b.steptime;
          else
            return -1
        })

        if (allpast?.length > 0) {
          const gameEvent = allpast[0];
          allpast[0].status = 1;
          switch (gameEvent.name) {
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

      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);


}
export default useGameReplayHandler