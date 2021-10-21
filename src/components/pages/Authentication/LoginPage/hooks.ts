import { useNavigate } from "@reach/router";
import { useCallback, useEffect } from "react";

import { useAuth, useCleanUrl } from "@reearth/auth";
import { useTeamsQuery } from "@reearth/gql";
import { useTeam, useNotification } from "@reearth/state";

export default () => {
  const { isAuthenticated, isLoading, error: authError, logout } = useAuth();
  const error = useCleanUrl();
  const navigate = useNavigate();
  const [currentTeam, setTeam] = useTeam();
  const [, setNotification] = useNotification();

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
    setNotification({
      type: "error",
      text: error,
    });
  }

  const onLogin = useCallback(
    (username: string, password: string) => {
      if (isAuthenticated) return;
      if (process.env.REEARTH_WEB_AUTH0_DOMAIN) {
        fetch(process.env.REEARTH_WEB_AUTH0_DOMAIN, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        });
      }
    },
    [isAuthenticated],
  );

  return {
    isLoading,
    isAuthenticated,
    onLogin,
  };
};
