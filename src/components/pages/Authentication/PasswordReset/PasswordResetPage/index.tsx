import React from "react";

import Loading from "@reearth/components/atoms/Loading";
import PasswordReset from "@reearth/components/organisms/Authentication/PasswordReset";

import useHooks from "../../hooks";

export type Props = {
  path?: string;
};

const PasswordResetPage: React.FC<Props> = () => {
  const { isLoading, isAuthenticated, onPasswordResetRequest } = useHooks();

  return isLoading ? (
    <Loading />
  ) : !isAuthenticated ? (
    <PasswordReset onPasswordResetRequest={onPasswordResetRequest} />
  ) : null;
};

export default PasswordResetPage;
