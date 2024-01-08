import PageProps from "../../model/PageProps";

const BoardHome: React.FC<PageProps> = (pageProp) => {
  return (
    <div
      style={{
        position: "relative",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: 18,
        backgroundColor: "white",
      }}
      onClick={() => console.log(pageProp)}
    ></div>
  );
};

export default BoardHome;
