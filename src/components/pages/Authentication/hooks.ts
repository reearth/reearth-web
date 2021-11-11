import { useNavigate } from "@reach/router";
import { useCallback, useEffect } from "react";
// import { useIntl } from "react-intl";

import { useAuth, useCleanUrl } from "@reearth/auth";
import { useTeamsQuery } from "@reearth/gql";
import { useTeam, useNotification } from "@reearth/state";

export default () => {
  // const intl = useIntl();
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

  useEffect(() => {
    const loginError = new URL(document.location.toString()).searchParams.get("error");

    if (loginError != null && loginError.length != 0) {
      setNotification({
        type: "error",
        text: loginError.toString(),
      });

      const searchParams = new URLSearchParams(window.location.search);
      searchParams.delete("error");
      if (history.replaceState) {
        const searchString =
          searchParams.toString().length > 0 ? "?" + searchParams.toString() : "";
        const newUrl =
          window.location.protocol +
          "//" +
          window.location.host +
          window.location.pathname +
          searchString +
          window.location.hash;
        history.replaceState(null, "", newUrl);
      }
    }
  }, [setNotification]);

  if (error) {
    setNotification({
      type: "error",
      text: error,
    });
  }

  const onSignup = useCallback(
    async (username: string, password: string) => {
      if (isAuthenticated) return;
      console.log(username + " " + password, "up");
    },
    [isAuthenticated],
  );

  const onPasswordReset = useCallback(
    async (username: string, password: string) => {
      if (isAuthenticated) return;
      console.log(username + " " + password, "up");
    },
    [isAuthenticated],
  );

  return {
    isLoading,
    isAuthenticated,
    passwordPolicy,
    onSignup,
    onPasswordReset,
  };
};
