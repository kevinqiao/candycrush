import { useSlideNavManager } from "component/SlideNavManager";
import { useConvex } from "convex/react";
import React, { useEffect, useState } from "react";
import { useUserManager } from "service/UserManager";
import styled from "styled-components";
import { api } from "../../convex/_generated/api";
import useCoord from "../../service/TerminalManager";
const Container = styled.div`
  display: flex;
  flexdirection: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  height: ${(props) => props.height};
  background-color: white;
  overflow-y: auto;
  overflow-x: hidden;
`;
const AssetListHome: React.FC = () => {
  const { width, height, headH, LobbyMenuH } = useCoord();
  const { user } = useUserManager();
  const [assets, setAssets] = useState<{ asset: number; amount: number }[]>([]);
  const { menuIndex } = useSlideNavManager();
  const convex = useConvex();
  useEffect(() => {
    const findAll = async () => {
      const all = await convex.query(api.asset.findByUser, { uid: user.uid, token: user.token });
      console.log(all);
      if (all) setAssets(all);
    };
    if (menuIndex === 1 && user) {
      findAll();
    }
  }, [menuIndex, user]);

  return (
    <Container height={`${height - headH}px`}>
      <div style={{ width: "100%", height: "100%" }}>
        <div style={{ height: width < height ? LobbyMenuH : 0 }}></div>
        {assets.map((asset) => (
          <div key={asset.asset}>
            {asset.asset}:{asset.amount}
          </div>
        ))}
      </div>
    </Container>
  );
};

export default AssetListHome;
