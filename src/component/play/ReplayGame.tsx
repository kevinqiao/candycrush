import PageProps from "../../model/PageProps";

const ReplayGame: React.FC<PageProps> = ({ data, position }) => {
  const { battleId, gameId } = data;

  return <div style={{ width: position?.width, height: position?.height, backgroundColor: "blue" }}></div>;
};

export default ReplayGame;
