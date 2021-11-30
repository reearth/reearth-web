import { useNavigate } from "@reach/router";
import { useEffect } from "react";

import { useTeam, useProject } from "@reearth/state";

type Params = {
  teamId: string;
};

export default (params: Params) => {
  const [currentTeam] = useTeam();
  const [currentProject] = useProject();
  const navigate = useNavigate();

  useEffect(() => {
    if (params.teamId && currentTeam?.id && params.teamId !== currentTeam.id) {
      navigate(`/settings/workspace/${currentTeam?.id}/asset`);
    }
  }, [params, currentTeam, navigate]);

  return {
    currentProject,
    currentTeam,
  };
};
