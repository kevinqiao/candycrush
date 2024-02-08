import React from "react";
import PageProps from "../../model/PageProps";
import AuthHome from "./AuthHome";
import { ClerkProvider } from "@clerk/clerk-react";

const SignIn: React.FC<PageProps> = ({ disableCloseBtn, close }) => {
  return (
    <ClerkProvider publishableKey={"pk_test_bm9ybWFsLXNoZXBoZXJkLTQ5LmNsZXJrLmFjY291bnRzLmRldiQ"}>
      <AuthHome close={close} disableCloseBtn={disableCloseBtn} />
    </ClerkProvider>
  );
};

export default SignIn;
