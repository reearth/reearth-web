import React from "react";

import Loading from "@reearth/components/atoms/Loading";
import Login from "@reearth/components/organisms/Authentication/Login";

import useHooks from "./hooks";

export type Props = {
  path?: string;
};

const LoginPage: React.FC<Props> = () => {
  const { isLoading, isAuthenticated, handleLogin } = useHooks();

  return isLoading ? <Loading /> : !isAuthenticated ? <Login handleLogin={handleLogin} /> : null;
};

export default LoginPage;
