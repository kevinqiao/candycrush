import DollarIcon from "component/icons/DollarIcon";
import PlayersIcon from "component/icons/PlayersIcon";
import { Tournament } from "model/Tournament";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePageManager } from "service/PageManager";
import useCoord from "service/TerminalManager";
import useTournamentManager from "service/TournamentManager";
import { getCurrentAppConfig } from "util/PageUtils";
import "./tournament.css";
interface Props {
  tournament?: Tournament;
}
const TournamentItem: React.FC<Props> = ({ tournament }: Props) => {
  const { width, height } = useCoord();
  const { join } = useTournamentManager();
  const divRef = useRef<HTMLDivElement | null>(null);
  const [fontSize, setFontSize] = useState(25);
  const { openPage } = usePageManager();

  const calculateFontSize = () => {
    if (divRef.current) {
      const divWidth = divRef.current.offsetWidth;
      const newFontSize = divWidth / 70;
      setFontSize(Math.round(newFontSize));
    }
  };
  useEffect(() => {
    calculateFontSize();
    window.addEventListener("resize", calculateFontSize);
    return () => {
      window.removeEventListener("resize", calculateFontSize);
    };
  }, []);

  const joinTournament = useCallback(async () => {
    if (tournament) {
      const rs = await join(tournament.id);
      if (rs && !rs.ok) {
        if (rs.code === 1) {
          console.log("you are in battle now");
        } else if (rs.code === 2) {
          const app = getCurrentAppConfig();
          openPage({ name: "battlePlay", ctx: app.context, data: { tournament } });
        }
      }
    }
  }, [tournament, join]);
  const render = useMemo(() => {
    return (
      <div ref={divRef} className="tournament-item roboto-bold" style={{ width: width > height ? "90%" : "100%" }}>
        <div style={{ width: "20%" }}>
          <div className="tournament-trophy">
            <div style={{ height: 20 }}></div>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: Math.max(fontSize + 5, 14), color: "yellow" }}>$40</span>
            </div>
            <div style={{ height: 10 }}></div>
            <div style={{ height: "25px" }}>
              <span style={{ fontSize: Math.max(fontSize - 5, 10), color: "white" }}>PRIZE POOL</span>
            </div>
          </div>
        </div>
        <div className="tournament-summary">
          <div style={{ height: 10 }}></div>
          <div style={{ marginLeft: 20, textAlign: "left" }}>
            <span style={{ fontSize: Math.max(fontSize + 5, 14) }}>Tournament({tournament?.type})</span>
          </div>
          <div style={{ height: 20 }}></div>
          <div style={{ marginLeft: 20, width: "10%", minWidth: 120 }}>
            <PlayersIcon players={5} />
          </div>
        </div>
        <div className="tournament-entryfee">
          <DollarIcon amount={40} />
          {tournament ? (
            <div className="play-tournament" onClick={joinTournament}>
              <span style={{ fontSize: Math.max(fontSize - 5, 12), color: "yellow" }}>PLAY</span>
            </div>
          ) : null}
        </div>
      </div>
    );
  }, [fontSize]);
  return <>{render}</>;
};

export default TournamentItem;
