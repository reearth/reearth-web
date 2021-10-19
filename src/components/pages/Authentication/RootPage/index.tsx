import React from "react";

import Loading from "@reearth/components/atoms/Loading";
import MoleculeRootPage from "@reearth/components/molecules/RootPage";

import useHooks from "./hooks";

export type Props = {
  path?: string;
};

const RootPage: React.FC<Props> = () => {
  const { isLoading, isAuthenticated } = useHooks();

  return isLoading ? <Loading /> : !isAuthenticated ? <MoleculeRootPage /> : null;
};

export default RootPage;
