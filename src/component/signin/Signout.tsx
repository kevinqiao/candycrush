import { ClerkProvider } from "@clerk/clerk-react";
import React from "react";
import LogoutHome from "./LogoutHome";

interface Props {
  onComplete: () => void;
  onCancel: () => void;
}
const Signout: React.FC<Props> = ({ onComplete, onCancel }) => {
  return (
    <ClerkProvider publishableKey={"pk_test_bm9ybWFsLXNoZXBoZXJkLTQ5LmNsZXJrLmFjY291bnRzLmRldiQ"}>
      <LogoutHome onComplete={onComplete} onCancel={onCancel} />
    </ClerkProvider>
  );
};

export default Signout;
