import { useEffect } from "react";
import { useNavigate } from "@reach/router";

import { useAuth, useCleanUrl } from "@reearth/auth";
import { notificationSystem } from "@reearth/globalHooks";
import { useTeam } from "@reearth/state";
import { useTeamsQuery } from "@reearth/gql";

export type Mode = "layer" | "widget";

export default () => {
  const { isAuthenticated, isLoading, error: authError, login, logout } = useAuth();
  const error = useCleanUrl();
  const navigate = useNavigate();
  const [currentTeam, setTeam] = useTeam();
  const { notify, notification } = notificationSystem();

  const { data, loading } = useTeamsQuery({ skip: !isAuthenticated });
  const teamId = currentTeam?.id || data?.me?.myTeam.id;

  useEffect(() => {
    if (!isAuthenticated || currentTeam || !data || !teamId) return;
    setTeam(data.me?.myTeam);
    navigate(`/dashboard/${teamId}`);
  }, [isAuthenticated, navigate, currentTeam, setTeam, data, teamId]);

  useEffect(() => {
    if (authError || (isAuthenticated && !loading && data?.me === null)) {
      logout();
    }
  }, [authError, data?.me, isAuthenticated, loading, logout]);

  if (error) {
    notify("error", error);
  }

  return {
    isLoading,
    isAuthenticated,
    login,
    notification,
  };
};
