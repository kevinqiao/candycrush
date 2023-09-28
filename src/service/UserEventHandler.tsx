import { useQuery } from "convex/react";
import { useCallback, useEffect } from "react";
import { api } from "../convex/_generated/api";
import BattleModel from "../model/Battle";
import useEventSubscriber from "./EventManager";
import { usePageManager } from "./PageManager";

const UserEventHandler: React.FC = () => {
  const { createEvent } = useEventSubscriber([], []);
  const { pushPage } = usePageManager();
  const userEvent: any = useQuery(api.events.getByUser, { uid: "kqiao" });

  const processBattleCreate = useCallback(
    (data: any) => {
      createEvent({
        name: "battleCreated",
        data,
        topic: "user",
        delay: 20,
      });
    },
    [createEvent]
  );

  useEffect(() => {
    console.log(userEvent);
    if (userEvent) {
      const name = userEvent.name;
      switch (name) {
        case "battleCreated":
          const battle = userEvent.data as BattleModel;
          pushPage({ name: "battlePlay", data: battle });

          // processBattleCreate(userEvent.data);
          break;

        default:
          break;
      }
    }
  }, [processBattleCreate, userEvent]);

  return <div></div>;
};

export default UserEventHandler;
