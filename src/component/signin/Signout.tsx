import React, { useCallback } from "react";
import { useSSOManager } from "service/SSOManager";

interface Props {
  onComplete: () => void;
  onCancel: () => void;
}

const Signout: React.FC<Props> = ({ onComplete, onCancel }) => {
  // const { signOut } = useClerk();
  const { signout } = useSSOManager();
  const complete = useCallback(() => {
    signout();
    // signOut().then((s) => {
    //   console.log("complete signout from clerk");
    onComplete();
    // });
  }, [signout]);
  const cancel = () => {
    onCancel();
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        width: "250px",
        height: "150px",
        backgroundColor: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "80px",
          height: "40px",
          backgroundColor: "blue",
        }}
        onClick={complete}
      >
        <span style={{ color: "white", fontSize: 15 }}>Ok</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "80px",
          height: "40px",
          backgroundColor: "blue",
        }}
        onClick={cancel}
      >
        <span style={{ color: "white", fontSize: 15 }}>Cancel</span>
      </div>
    </div>
  );
};

export default Signout;
