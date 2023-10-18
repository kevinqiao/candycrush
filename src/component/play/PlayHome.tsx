const PlayHome: React.FC = () => {
  return (
    <>
      <div style={{ width: "100%", height: "100vh", backgroundColor: "green" }}>
        <div style={{ display: "flex", justifyContent: "space-around", width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 40,
              width: 100,
              backgroundColor: "red",
              color: "white",
            }}
          >
            Join
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 40,
              width: 100,
              backgroundColor: "red",
              color: "white",
            }}
          >
            New
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 40,
              width: 100,
              backgroundColor: "red",
              color: "white",
            }}
          >
            Sync
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 40,
              width: 100,
              backgroundColor: "red",
              color: "white",
            }}
          >
            Replay
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayHome;
