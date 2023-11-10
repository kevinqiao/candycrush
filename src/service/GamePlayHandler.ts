import { useConvex, useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../convex/_generated/api";
import { GameEvent } from "../model/GameEvent";
import { GameModel } from "../model/GameModel";
// export interface GameEvent {
//   id: string;
//   name: string;
//   data: any;
//   steptime: number;
// }
const useGamePlayHandler = (battleId: string | undefined, game: GameModel | null, isReplay: boolean, pid: string | null | undefined) => {
  const convex = useConvex();
  const startTimeRef = useRef<number>(Date.now());
  const lastEventRef = useRef<GameEvent | null>(null);
  const [event, setEvent] = useState<GameEvent | null>(null)
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([])
  // const { createEvent } = useEventSubscriber([], []);
  const gameEvent: any = useQuery(api.events.getByGame, { gameId: game?.gameId, laststep: -1 });


  const processMatchSolved = (gevent: GameEvent) => {

    if (!game) return;

    for (let res of gevent.data) {

      console.log(JSON.parse(JSON.stringify({ pid, cells: game.cells })))

      console.log(JSON.parse(JSON.stringify({ pid, cells: game.cells })))
    }
  }

  const processSwapped = useCallback((gevent: GameEvent) => {

    if (!game) return;

    if (gevent.data.candy) {
      const candy = game.cells.find((c) => c.id === gevent.data.candy.id);
      if (candy)
        Object.assign(candy, gevent.data.candy);
    }
    if (gevent.data.target) {
      const target = game.cells.find((c) => c.id === gevent.data.target.id);
      if (target)
        Object.assign(target, gevent.data.target);
    }


  }, [game])

  useEffect(() => {
    if (gameEvent && !isReplay) {
      const oevent = gameEvents.find((e) => e.id === gameEvent.id);
      if (!oevent) {
        const name = gameEvent.name;
        switch (name) {
          case "matchSolved":
            processMatchSolved(gameEvent)
            break;
          case "cellSwapped":
            processSwapped(gameEvent)
            break;
          default:
            break;
        }
        gameEvents.push(gameEvent)
      } else {
        console.log("event already processed with id:" + gameEvent.id)
      }

    }
  }, [gameEvent]);

  useEffect(() => {
    const loadEvents = async () => {
      console.log("loading events:" + game?.gameId)
      if (game?.gameId) {
        const events = await convex.query(api.events.findAllByGame, {
          gameId: game?.gameId,
        });
        console.log(events)
        if (events) {
          startTimeRef.current = Date.now();
          setGameEvents(events)
        }
      }
    }
    if (game && convex && isReplay)
      loadEvents();

  }, [isReplay, convex, game])

  useEffect(() => {
    if (gameEvents?.length === 0 || !gameEvents) return
    const timer = setInterval(() => {
      const pastTime = Date.now() - startTimeRef.current;
      const stepTime = lastEventRef.current ? lastEventRef.current.steptime : 0;
      const pastEvents = gameEvents.filter((event) => event.steptime && event.steptime > stepTime && event.steptime <= pastTime).sort((a, b) => a.steptime - b.steptime)
      if (pastEvents?.length > 0) {
        lastEventRef.current = pastEvents[0]
        console.log(pastEvents[0])
        switch (pastEvents[0].name) {
          case "matchSolved":
            processMatchSolved(pastEvents[0])
            break;
          case "cellSwapped":
            processSwapped(pastEvents[0])
            break;
          default:
            break;
        }

        setTimeout(() => {
          setEvent(pastEvents[0])
        }, 10,)
      }

    }, 200)
    return () => {
      clearInterval(timer);
    };

  }, [gameEvents])
  return { gameEvent: isReplay ? event : gameEvent }
}
export default useGamePlayHandler