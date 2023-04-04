import axios from "axios";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth, useCleanUrl } from "@reearth/auth";
import { useGetTeamsQuery } from "@reearth/gql";
import { useT } from "@reearth/i18n";
import { useTeam, useNotification, useWorkspaceId, useUserId } from "@reearth/state";

export type Mode = "layer" | "widget";

export default () => {
  const t = useT();
  const { isAuthenticated, isLoading, error: authError, login, logout } = useAuth();
  const [error, isErrorChecked] = useCleanUrl();
  const navigate = useNavigate();
  const [currentTeam, setTeam] = useTeam();
  const [currentUserId, setCurrentUserId] = useUserId();
  const [, setNotification] = useNotification();
  const [currentWorkspaceId, setCurrentWorkspaceId] = useWorkspaceId();

  const { data, loading } = useGetTeamsQuery({ skip: !isAuthenticated });

  if (isAuthenticated && !currentUserId) {
    setCurrentUserId(data?.me?.id);
  }

  let teamId = currentTeam?.id || data?.me?.myTeam.id;
  if (currentWorkspaceId && currentUserId === data?.me?.id) {
    teamId = currentWorkspaceId;
  }

  const verifySignup = useCallback(
    async (token: string) => {
      const res = await axios.post(
        (window.REEARTH_CONFIG?.api || "/api") + "/signup/verify/" + token,
      );

      if (res.status === 200) {
        setNotification({
          type: "success",
          text: t("Your account has been successfully verified! Feel free to login now."),
        });
        navigate("/login");
      } else {
        setNotification({
          type: "error",
          text: t("Could not verify your signup. Please start the process over."),
        });
        navigate("/signup");
      }
    },
    [t, navigate, setNotification],
  );

  useEffect(() => {
    if (!isErrorChecked || error) return;

    if (window.location.search) {
      const searchParam = new URLSearchParams(window.location.search).toString().split("=");
      if (searchParam[0] === "user-verification-token") {
        verifySignup(searchParam[1]);
      } else if (searchParam[0] === "pwd-reset-token") {
        navigate(`/password-reset/?token=${searchParam[1]}`);
      }
    } else if (!isAuthenticated && !isLoading) {
      login();
    } else {
      if (currentTeam || !data || !teamId) return;
      setTeam(teamId ? data.me?.teams.find(t => t.id === teamId) : data?.me?.myTeam ?? undefined);
      setCurrentWorkspaceId(teamId);
      navigate(`/dashboard/${teamId}`);
    }
  }, [
    isAuthenticated,
    login,
    isLoading,
    verifySignup,
    navigate,
    currentTeam,
    setTeam,
    data,
    teamId,
    isErrorChecked,
    error,
  ]);

  useEffect(() => {
    if (isErrorChecked && (authError || (isAuthenticated && !loading && data?.me === null))) {
      logout();
    }
  }, [authError, data?.me, isAuthenticated, isErrorChecked, loading, logout]);

  useEffect(() => {
    if (error) {
      setNotification({
        type: "error",
        text: error,
      });
    }
  }, [error, setNotification]);

  return {
    error,
    isLoading,
    isAuthenticated,
  };
};
