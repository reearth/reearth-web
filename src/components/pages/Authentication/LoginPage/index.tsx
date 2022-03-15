import React from "react";

import Loading from "@reearth/components/atoms/Loading";
import Login from "@reearth/components/organisms/Authentication/Login";

import { useUserTokenRequired } from "./hook";

export type Props = {
  path?: string;
};

const LoginPage: React.FC<Props> = () => {
  const [isAuthenticated, isLoading] = useUserTokenRequired();

  return isLoading ? <Loading /> : !isAuthenticated ? <Login /> : null;
};

export default LoginPage;
