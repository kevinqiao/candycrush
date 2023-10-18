import { usePageManager } from "../../service/PageManager";
import "./menu.css";

const MainMenu: React.FC = () => {
  const { openPage } = usePageManager();

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 1000,
        top: 20,
        right: 10,
        width: 70,
        height: 35,
        borderRadius: 4,
        backgroundColor: "white",
        color: "blue",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={() => openPage({ name: "membership", data: {} })}
    >
      Menu
    </div>
  );
};

export default MainMenu;
