import { useApolloClient } from "@apollo/client";
import { useNavigate } from "@reach/router";
import { useEffect } from "react";

import assetHooks from "@reearth/components/organisms/Common/AssetModal/hooks";
import { useTeam, useProject } from "@reearth/state";

export type Params = {
  teamId: string;
};

export default (params: Params) => {
  const navigate = useNavigate();
  const gqlCache = useApolloClient().cache;
  const [currentTeam] = useTeam();
  const [currentProject] = useProject();

  const {
    assets,
    isLoading,
    hasMoreAssets,
    sort,
    searchTerm,
    getMoreAssets,
    createAssets,
    handleSortChange,
    handleSearchTerm,
    handleModalClose,
    removeAssets,
  } = assetHooks(currentTeam?.id);

  useEffect(() => {
    if (params.teamId && currentTeam?.id && params.teamId !== currentTeam.id) {
      navigate(`/settings/workspace/${currentTeam?.id}/asset`);
    }
  }, [params, currentTeam, navigate]);

  useEffect(() => {
    return () => {
      gqlCache.evict({ fieldName: "assets" });
    };
  }, [gqlCache]);

  return {
    currentProject,
    currentTeam,
    assets,
    isLoading,
    hasMoreAssets,
    sort,
    searchTerm,
    getMoreAssets,
    createAssets,
    handleSortChange,
    handleSearchTerm,
    handleModalClose,
    removeAssets,
  };
};
