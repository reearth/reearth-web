import React from "react";

import Loading from "@reearth/components/atoms/Loading";
import Signup from "@reearth/components/organisms/Authentication/Signup";

import useHooks from "../hooks";

export type Props = {
  path?: string;
};

const SignupPage: React.FC<Props> = () => {
  const { isLoading, isAuthenticated, onLogin, passwordPolicy } = useHooks();

  return isLoading ? (
    <Loading />
  ) : !isAuthenticated ? (
    <Signup onSignup={onLogin} passwordPolicy={passwordPolicy} />
  ) : null;
};

export default SignupPage;
