import React from "react";

import Loading from "@reearth/components/atoms/Loading";
import NewPassword from "@reearth/components/organisms/Authentication/PasswordReset/newPassword";

import useHooks from "../../hooks";

export type Props = {
  path?: string;
};

const NewPasswordPage: React.FC<Props> = () => {
  const { isLoading, isAuthenticated, onNewPasswordSubmit, passwordPolicy } = useHooks();

  return isLoading ? (
    <Loading />
  ) : !isAuthenticated ? (
    <NewPassword onNewPasswordSubmit={onNewPasswordSubmit} passwordPolicy={passwordPolicy} />
  ) : null;
};

export default NewPasswordPage;
