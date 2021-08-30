import React from "react";

import MoleculeTopPage from "@reearth/components/molecules/TopPage";
import Loading from "@reearth/components/atoms/Loading";
import NotificationBanner from "@reearth/components/atoms/NotificationBanner";

import useHooks from "./hooks";

export type Props = {
  path?: string;
};

const TopPage: React.FC<Props> = () => {
  const { isLoading, isAuthenticated, login, notification } = useHooks();

  return isLoading ? (
    <Loading />
  ) : !isAuthenticated ? (
    <MoleculeTopPage login={login}>
      {notification && <NotificationBanner notification={notification} />}
    </MoleculeTopPage>
  ) : null;
};

export default TopPage;
