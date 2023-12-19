import PageProps from "../../model/PageProps";

const ReplayBattle: React.FC<PageProps> = ({ data, position }) => {
  const { gameId } = data;
  console.log(data);
  return <div style={{ width: position?.width, height: position?.height, backgroundColor: "blue" }}></div>;
};

export default ReplayBattle;
