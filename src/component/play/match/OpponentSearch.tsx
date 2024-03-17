import { useSearchMatch } from "component/animation/battle/useSearchMatch";
import { SCENE_NAME } from "model/Constants";
import React, { useCallback, useMemo, useRef } from "react";
import { useSceneManager } from "service/SceneManager";
import "./search.css";
interface Props {
  battleId: string | null;
}
const OpponentSearch: React.FC<Props> = ({ battleId }) => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const { scenes } = useSceneManager();
  const animation = useSearchMatch();

  const eles = useCallback(() => {
    const es = new Map<string, HTMLDivElement>();
    if (sceneContainerRef.current) es.set("containerEle", sceneContainerRef.current);
    if (searchRef.current) es.set("searchEle", searchRef.current);
    return Object.fromEntries(es);
  }, [sceneContainerRef.current, searchRef.current]);

  const load = useCallback(
    (type: number, el: HTMLDivElement | null) => {
      if (el) {
        switch (type) {
          case 0:
            sceneContainerRef.current = el;
            break;
          case 1:
            searchRef.current = el;
            break;
          default:
            break;
        }
        if (sceneContainerRef.current && searchRef.current) {
          scenes.set(SCENE_NAME.BATTLE_SEARCH, { ...eles(), type: 1 });
          if (!battleId) {
            animation.playSearch(null);
          }
        }
      }
    },
    [scenes]
  );
  const render = useMemo(() => {
    if (!scenes) return null;
    return (
      <>
        <div ref={(el) => load(0, el)} className="search_container">
          <div ref={(el) => load(1, el)} className="search_sprite">
            <span style={{ fontSize: 20 }}>Searching...</span>
          </div>
        </div>
      </>
    );
  }, [scenes]);
  return <>{render}</>;
};

export default OpponentSearch;
