import { useEffect } from "react";
import { useNavigate } from "@reach/router";

import { useAuth, useCleanUrl } from "@reearth/auth";
import { useLocalState } from "@reearth/state";
import { useTeamsQuery } from "@reearth/gql";
import { reportError } from "@reearth/sentry";

export type Mode = "layer" | "widget";

export default () => {
  const { isAuthenticated, isLoading, error: authError, login, logout } = useAuth();
  const error = useCleanUrl();
  const navigate = useNavigate();

  const [{ currentTeam }, setLocalState] = useLocalState(s => ({ currentTeam: s.currentTeam }));

  const { data, loading, error: gqlError } = useTeamsQuery({ skip: !isAuthenticated });
  if (gqlError) {
    reportError(gqlError);
  }
  const teamId = currentTeam?.id || data?.me?.myTeam.id;

  useEffect(() => {
    if (!isAuthenticated || currentTeam || !data || !teamId) return;
    setLocalState({ currentTeam: data.me?.myTeam });
    navigate(`/dashboard/${teamId}`);
  }, [isAuthenticated, navigate, currentTeam, setLocalState, data, teamId]);

  useEffect(() => {
    if (authError || (loading && data?.me === null) || gqlError) {
      logout();
    }
  }, [authError, data?.me, gqlError, isAuthenticated, loading, logout]);

  return {
    isLoading,
    isAuthenticated,
    login,
    error,
  };
};
