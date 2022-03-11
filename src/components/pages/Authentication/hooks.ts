import { useNavigate } from "@reach/router";
import axios from "axios";
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

  const handleSignup = useCallback(
    async (email?: string, username?: string, password?: string) => {
      if (isAuthenticated || !email || !username || !password) return;
      const res = await axios.post((window.REEARTH_CONFIG?.api || "/api") + "/signup", {
        email,
        username,
        password,
      });
      if (res.status !== 200) {
        setNotification({
          type: "error",
          text: intl.formatMessage({ defaultMessage: "Something went wrong. Please try again." }),
        });
        return res;
      } else {
        setNotification({
          type: "success",
          text: intl.formatMessage({
            defaultMessage: "Successfully sent verification email! Please check your inbox.",
          }),
        });
        return res;
      }
    },
    [isAuthenticated, setNotification, intl],
  );

  const handlePasswordResetRequest = useCallback(
    async (email?: string) => {
      if (isAuthenticated || !email) return;
      const res = await axios.post((window.REEARTH_CONFIG?.api || "/api") + "/password-reset", {
        email,
      });
      if (res.status !== 200) {
        setNotification({
          type: "error",
          text: intl.formatMessage({ defaultMessage: "Something went wrong. Please try again." }),
        });
        return res;
      } else {
        setNotification({
          type: "success",
          text: intl.formatMessage({
            defaultMessage: "Successfully sent verification email! Please check your inbox.",
          }),
        });
        return res;
      }
    },
    [isAuthenticated, setNotification, intl],
  );

  const handleNewPasswordSubmit = useCallback(
    async (newPassword?: string, email?: string, token?: string) => {
      if (isAuthenticated || !newPassword || !email || !token) return;
      const res = await axios.post((window.REEARTH_CONFIG?.api || "/api") + "/password-reset", {
        email,
        password: newPassword,
        token,
      });
      if (res.status === 200) {
        setNotification({
          type: "success",
          text: intl.formatMessage({
            defaultMessage:
              "Successfully changed password! Please use your new password next time you login.",
          }),
        });
        navigate("/login");
      } else {
        setNotification({
          type: "error",
          text: intl.formatMessage({
            defaultMessage: "Something went wrong. Please try again.",
          }),
        });
      }
    },
    [isAuthenticated, intl, setNotification, navigate],
  );

  return {
    isLoading,
    isAuthenticated,
    passwordPolicy,
    handleSignup,
    handlePasswordResetRequest,
    handleNewPasswordSubmit,
  };
};