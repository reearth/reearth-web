import { useNavigate } from "@reach/router";
import { useCallback, useEffect } from "react";
import { useIntl } from "react-intl";

import { useAuth, useCleanUrl } from "@reearth/auth";
import { useTeamsQuery } from "@reearth/gql";
import { useTeam, useNotification } from "@reearth/state";

export default () => {
  const intl = useIntl();
  const { isAuthenticated, isLoading, error: authError, logout } = useAuth();
  const error = useCleanUrl();
  const navigate = useNavigate();
  const [currentTeam, setTeam] = useTeam();
  const [, setNotification] = useNotification();
  const passwordPolicy = window.REEARTH_CONFIG?.passwordPolicy;

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
    async (username: string, password: string) => {
      if (isAuthenticated) return;
      const res = await fetch(`${window.REEARTH_CONFIG?.api || "/api"}/login`, {
        redirect: "manual",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          // TODO: the id value should be taken from the queryParams[id]
          id: "01FK2YWGZ6MSRTEYJR01Q1Z5Q6",
          username,
          password,
        }),
      });
      // TODO: here we need to check if the res is a redirection 301, 302 we need to make it manually
      if (!res.ok) {
        setNotification({
          type: "error",
          text: intl.formatMessage({
            defaultMessage:
              "Could not log in. Please make sure you inputted the correct username and password and try again.",
          }),
        });
      }
    },
    [isAuthenticated, intl, setNotification],
  );

  return {
    isLoading,
    isAuthenticated,
    onLogin,
    passwordPolicy,
  };
};
