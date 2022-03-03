import { useNavigate } from "@reach/router";
import { useEffect } from "react";

import assetHooks from "@reearth/components/organisms/Common/AssetModal/hooks";
import { useTeam, useProject } from "@reearth/state";

export enum AssetSortType {
  Date = "DATE",
  Name = "NAME",
  Size = "SIZE",
}

export type Params = {
  teamId: string;
};

export default (params: Params) => {
  const navigate = useNavigate();
  const [currentTeam] = useTeam();
  const [currentProject] = useProject();

  const { assetsData } = assetHooks(currentTeam?.id);

  useEffect(() => {
    if (params.teamId && currentTeam?.id && params.teamId !== currentTeam.id) {
      navigate(`/settings/workspace/${currentTeam?.id}/asset`);
    }
  }, [params, currentTeam, navigate]);

  return {
    currentProject,
    currentTeam,
    assetsData,
  };
};
