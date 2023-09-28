import { useConvex, useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../convex/_generated/api";
import { GameModel } from "../model/GameModel";
import useEventSubscriber from "./EventManager";
import * as gameEngine from "./GameEngine";
interface GameEvent {
  id: string;
  name: string;
  data: any;
  steptime: number;
}
const useGamePlayHandler = (battleId: string | undefined, game: GameModel | null, isReplay: boolean) => {
  const convex = useConvex();
  const startTimeRef = useRef<number>(Date.now());
  const lastEventRef = useRef<GameEvent | null>(null);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([])
  const { createEvent } = useEventSubscriber([], []);
  const gameEvent: any = useQuery(api.events.getByGame, { gameId: game?.gameId, battleId });

  const processMatchSolved = useCallback((data: any) => {

    if (!game) return;
    for (let res of data) {
      const id = res.id;
      game.cells = gameEngine.applyMatches(game.cells, res);
      game.cells.sort((a, b) => {
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
  }, [game, createEvent])

  const processSwapped = useCallback((data: any) => {

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
  }, [game, createEvent])

  useEffect(() => {
    if (gameEvent && !isReplay) {
      console.log(gameEvent)
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

  useEffect(() => {
    const loadEvents = async () => {
      if (game?.gameId) {
        const events = await convex.query(api.events.findAllByGame, {
          gameId: game?.gameId,
        });
        if (events) {
          startTimeRef.current = Date.now();
          setGameEvents(events)
        }
      }
    }
    if (game && isReplay)
      loadEvents();

  }, [isReplay, game])

  useEffect(() => {
    if (gameEvents?.length === 0 || !gameEvents) return
    const timer = setInterval(() => {
      const pastTime = Date.now() - startTimeRef.current;
      const stepTime = lastEventRef.current ? lastEventRef.current.steptime : 0;
      const pastEvents = gameEvents.filter((event) => event.steptime && event.steptime > stepTime && event.steptime <= pastTime).sort((a, b) => a.steptime - b.steptime)
      if (pastEvents?.length > 0) {
        lastEventRef.current = pastEvents[0]
        switch (pastEvents[0].name) {
          case "matchSolved":
            processMatchSolved(pastEvents[0].data)
            break;
          case "cellSwapped":
            processSwapped(pastEvents[0].data)
            break;
          default:
            break;
        }
      }

    }, 200)
    return () => {
      clearInterval(timer);
    };

  }, [gameEvents])

}
export default useGamePlayHandler