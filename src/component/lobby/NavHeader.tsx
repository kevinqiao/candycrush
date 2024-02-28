import gsap from "gsap";
import React, { useEffect, useRef } from "react";
import useCoord from "service/CoordManager";
import styled from "styled-components";
const CloseButton = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 35px;
  background-color: blue;
  border-radius: 0px 0px 0px 8px;
  color: white;
`;
const Mask = styled.div`
  position: fixed;
  z-index: 9999;
  top: 0px;
  left: 0px;
  opacity: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
`;
const MenuPanel = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: fixed;
  z-index: 10000;
  top: 10px;
  right: -190px;
  height: 300px;
  width: 190px;
  background-color: white;
  border-radius: 8px 0px 0px 8px;
`;
const MenuList = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
`;
const MenuItem = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80%;
  height: 35px;
  background-color: blue;
  border-radius: 4px;
  margin-top: 10px;
`;
const NavHead = styled.div`
  position: relative;
  left: 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${(props) => props.height};
  width: ${(props) => props.width};
  min-width: 400px;
  background-color: blue;
  border-radius: 0px 0px 8px 8px;
`;
const Avatar = styled.div`
  width: 40px;
  height: 40px;
  background-image: url("/avatars/1.svg");
  background-size: cover;
`;
const AssetContainer = styled.div`
  marign-left: 50px;
  height: 100%;
  display: flex;
  align-items: center;
`;
const Asset = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  width: 60px;
  height: 25px;
  margin-left: 10px;
  background-color: grey;
  border-radius: 7px;
`;
const Diamond = styled.div`
  position: relative;
  left: -10px;
  width: 25px;
  height: 25px;
  background-image: url("icons/diamond_gold.svg");
  background-size: cover;
`;
const Coin = styled.div`
  position: relative;
  left: -12px;
  width: 25px;
  height: 25px;
  background-image: url("icons/coin.svg");
  background-size: cover;
`;
const MenuIcon = styled.div`
  cursor: pointer;
  width: 35px;
  height: 35px;
  margin-right: 10px;
  background-image: url("icons/list.svg");
  background-size: cover;
`;

const NavHeader = () => {
  const { headH } = useCoord();
  const maskRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const openMenu = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        tl.kill();
      },
    });
    tl.to(maskRef.current, { autoAlpha: 1, duration: 0.7 });
    tl.to(menuRef.current, { x: -190, duration: 0.7 }, "<");
    tl.play();
    console.log("open menu");
  };
  const closeMenu = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        tl.kill();
      },
    });
    tl.to(maskRef.current, { autoAlpha: 0, duration: 0.7 });
    tl.to(menuRef.current, { x: 0, duration: 0.7 }, "<");
    tl.play();
    console.log("close menu");
  };
  useEffect(() => {
    gsap.to(maskRef.current, { autoAlpha: 0, duration: 0 });
  }, []);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <NavHead height={`${headH}px`} width={"100%"}>
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", height: "100%" }}>
            <Avatar></Avatar>
            <div style={{ width: 20 }} />
            <AssetContainer>
              <Asset>
                <Diamond />
                <span style={{ color: "white", fontSize: 12 }}>40</span>
              </Asset>
              <div style={{ width: 40 }} />
              <Asset>
                <Coin />
                <span style={{ color: "white", fontSize: 12 }}>100</span>
              </Asset>
            </AssetContainer>
          </div>
          <MenuIcon onClick={openMenu} />
        </NavHead>
      </div>
      <Mask ref={maskRef} onClick={closeMenu} />
      <MenuPanel ref={menuRef}>
        <MenuList>
          {Array.from({ length: 4 }, (_, k) => k).map((p, index) => (
            <MenuItem key={p}>
              <span style={{ color: "white" }}>Menu{index}</span>
            </MenuItem>
          ))}
        </MenuList>
        <CloseButton onClick={closeMenu}>
          <span>Close</span>
        </CloseButton>
      </MenuPanel>
    </>
  );
};

export default NavHeader;
