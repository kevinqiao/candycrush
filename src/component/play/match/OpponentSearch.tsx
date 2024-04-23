import { useSearchMatch } from "component/animation/battle/useSearchMatch";
import { BATTLE_LOAD, SCENE_NAME } from "model/Constants";
import React, { useEffect, useMemo, useRef } from "react";
import { useSceneManager } from "service/SceneManager";
import "./search.css";
interface Props {
  battleId: string | null;
}
const OpponentSearch: React.FC = () => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const { load, scenes } = useSceneManager();
  const { playSearch, closeSearch } = useSearchMatch();

  useEffect(() => {
    if (sceneContainerRef.current && searchRef.current) {
      if (!scenes.has(SCENE_NAME.BATTLE_SEARCH)) {
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
            <span style={{ fontSize: 20 }}>Searching...</span>
          </div>
        </div>
      </>
    );
  }, [scenes]);
  return <>{render}</>;
};

export default OpponentSearch;
