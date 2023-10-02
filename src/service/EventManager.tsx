import { useQuery } from "convex/react";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Subject } from "rxjs";
import { api } from "../convex/_generated/api";
import { useUserManager } from "./UserManager";
export declare type EventModel = {
  name: string;
  topic?: string;
  time?: number;
  delay: number;
  data?: any;
};
export interface IContextProps {
  subject: Subject<EventModel> | null;
}

export const EventContext = createContext<IContextProps>({
  subject: null,
} as IContextProps);

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
  const subject = new Subject<EventModel>();
  return <EventContext.Provider value={{ subject: subject }}>{children}</EventContext.Provider>;
};

const useEventSubscriber = (selectors: string[], topics: string[]) => {
  const { uid, name } = useUserManager();
  const [event, setEvent] = useState<EventModel | null>(null);
  const { subject } = useContext(EventContext);
  const userEvent: any = useQuery(api.events.getByUser, { uid: uid ?? "###" });
  useEffect(() => {
    if (userEvent) {
      setEvent(userEvent);
    }
  }, [userEvent]);
  useEffect(() => {
    if (selectors && selectors.length > 0 && subject) {
      const observable = subject.asObservable();
      const subscription = observable.subscribe((event: EventModel) => {
        if (
          (!topics || topics.length === 0 || !event.topic || topics?.includes(event.topic)) &&
          selectors?.includes(event.name)
        )
          setEvent(event);
      });
      return () => subscription.unsubscribe();
    }
  }, [selectors, topics, subject]);

  const createEvent = useCallback(
    (event: EventModel) => {
      if (subject) {
        setTimeout(() => subject.next(event), event.delay);
      }
    },
    [subject]
  );
  return { event, createEvent };
};
export default useEventSubscriber;
