import React from "react";
import { useIntl } from "react-intl";

import MoleculeTopPage from "@reearth/components/molecules/TopPage";
import Loading from "@reearth/components/atoms/Loading";
import NotificationBanner from "@reearth/components/atoms/NotificationBanner";

import useHooks from "./hooks";

export type Props = {
  path?: string;
};

const TopPage: React.FC<Props> = () => {
  const intl = useIntl();
  const { isLoading, isAuthenticated, login, error } = useHooks();

  return isLoading ? (
    <Loading />
  ) : !isAuthenticated ? (
    <MoleculeTopPage login={login}>
      {error && (
        <NotificationBanner type="error">
          {intl.formatMessage({ defaultMessage: "Sign in error" })}: {error}
        </NotificationBanner>
      )}
    </MoleculeTopPage>
  ) : null;
};

export default TopPage;
