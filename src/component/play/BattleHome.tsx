import { useEffect, useState } from "react";
import BattleModel from "../../model/Battle";
import useEventSubscriber from "../../service/EventManager";

const BattleHome: React.FC = () => {
  const [battle, setBattle] = useState<BattleModel>();
  const { event, createEvent } = useEventSubscriber(["battleCreated"], ["user"]);
  const [gameId, setGameId] = useState<string | null>();

  console.log("battle home");
  useEffect(() => {
    if (event?.name === "battleCreated") {
      setBattle(event.data);
    }
  }, [event]);
  return (
    <>
      <div style={{ width: "100vw", height: "100vh", backgroundColor: "blue" }}>
        <div style={{ display: "flex", justifyContent: "space-around", width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 40,
              width: 100,
              backgroundColor: "red",
              color: "white",
            }}
          >
            Join
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 40,
              width: 100,
              backgroundColor: "red",
              color: "white",
            }}
          >
            New
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 40,
              width: 100,
              backgroundColor: "red",
              color: "white",
            }}
          >
            Sync
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 40,
              width: 100,
              backgroundColor: "red",
              color: "white",
            }}
            onClick={() => setGameId("31p0w58jxagdpab0jn2e6b1b9jhtk5r")}
          >
            Replay
          </div>
        </div>
      </div>
    </>
  );
};

export default BattleHome;
