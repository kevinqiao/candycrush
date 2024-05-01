import { useSearchMatch } from "component/animation/battle/useSearchMatch";
import { BATTLE_LOAD } from "model/Constants";
import { SCENE_NAME } from "model/Match3Constants";
import React, { useEffect, useMemo, useRef } from "react";
import { useSceneManager } from "service/SceneManager";
import useTournamentManager from "service/TournamentManager";
import "./search.css";
interface props {
  onExit: () => void;
}
const OpponentSearch: React.FC<props> = ({ onExit }) => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const { load, scenes } = useSceneManager();
  const { playSearch, closeSearch } = useSearchMatch();
  const { exit } = useTournamentManager();
  const cancelSearch = () => {
    exit();
    onExit();
  };

  useEffect(() => {
    if (sceneContainerRef.current && searchRef.current) {
      if (scenes && !scenes.has(SCENE_NAME.BATTLE_SEARCH)) {
        const es = new Map<string, HTMLDivElement>();
        es.set("containerEle", sceneContainerRef.current);
        es.set("searchEle", searchRef.current);
        const eles = Object.fromEntries(es);
        scenes.set(SCENE_NAME.BATTLE_SEARCH, { ...eles, type: 1 });
      }
    }
  }, [scenes]);
  useEffect(() => {
    if (load === BATTLE_LOAD.PLAY) playSearch(null);
    else closeSearch(null);
  }, [load]);
  const render = useMemo(() => {
    if (!scenes) return null;
    return (
      <>
        <div ref={sceneContainerRef} className="search_container">
          <div ref={searchRef} className="search_sprite">
            <div className="search_tip">
              <span style={{ fontSize: 20 }}>Searching...</span>
            </div>
            <div style={{ height: 20 }}></div>
            <div className="cancel_btn" style={{ cursor: "pointer" }} onClick={cancelSearch}>
              <span>Cancel</span>
            </div>
          </div>
        </div>
      </>
    );
  }, [scenes]);
  return <>{render}</>;
};

export default OpponentSearch;
