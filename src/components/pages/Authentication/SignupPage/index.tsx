import React from "react";

import Loading from "@reearth/components/atoms/Loading";
import Signup from "@reearth/components/organisms/Authentication/Signup";

import useHooks from "../hooks";

export type Props = {
  path?: string;
};

const SignupPage: React.FC<Props> = () => {
  const { isLoading, isAuthenticated, onSignup, passwordPolicy } = useHooks();

  return isLoading ? (
    <Loading />
  ) : !isAuthenticated ? (
    <Signup onSignup={onSignup} passwordPolicy={passwordPolicy} />
  ) : null;
};

export default SignupPage;
