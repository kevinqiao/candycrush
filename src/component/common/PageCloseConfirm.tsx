const PageCloseConfirm: React.FC<{ onConfirm: () => void }> = ({ onConfirm }) => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "red",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 100,
            height: 40,
            backgroundColor: "blue",
            borderRadius: 4,
            color: "white",
          }}
          onClick={onConfirm}
        >
          <span>Confirm</span>
        </div>
      </div>
    </div>
  );
};

export default PageCloseConfirm;
