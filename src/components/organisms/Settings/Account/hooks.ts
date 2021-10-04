import { useApolloClient } from "@apollo/client";
import { useCallback } from "react";
import { useIntl } from "react-intl";

import { PasswordPolicy } from "@reearth/components/molecules/Settings/Account/PasswordModal";
import { useUpdateMeMutation, useProfileQuery } from "@reearth/gql";
import { useTeam, useProject, useNotification } from "@reearth/state";

export enum Theme {
  Default = "DEFAULT",
  Light = "LIGHT",
  Dark = "DARK",
}

export default () => {
  const intl = useIntl();
  const [, setNotification] = useNotification();
  const client = useApolloClient();
  const [currentTeam] = useTeam();
  const [currentProject] = useProject();

  const { data: profileData } = useProfileQuery();
  const me = profileData?.me;
  const auths = profileData?.me?.auths;
  const hasPassword = auths?.includes("auth0") ?? false;

  // Currently Auth0 policy. In future will be passed from
  // backend depending on choosen type of authentication.
  const passwordPolicy: PasswordPolicy = {
    tooShort: /^(?=.{1,7}$)/,
    tooLong: /^(?=.{128,}$)/,
    whitespace: /(?=.*\s)/,
    lowSecurity: /^((?=\d)|(?=[a-z])|(?=[A-Z]))/,
    medSecurity: /^((?=.*[a-z])(?=.*[A-Z])|(?=.*[A-Z])(?=.*\d)|(?=.*[a-z])(?=.*\d))/,
    highSecurity: /^(?=.*[a-z])(?=.*[A-Z])((?=(.*\d){2}))/,
  };

  const [updateMeMutation] = useUpdateMeMutation();

  const updateName = useCallback(
    async (name: string) => {
      const username = await updateMeMutation({ variables: { name } });
      if (username.errors) {
        setNotification({
          type: "error",
          text: intl.formatMessage({ defaultMessage: "Failed to update account name." }),
        });
      }
    },
    [updateMeMutation, intl, setNotification],
  );

  const updatePassword = useCallback(
    async (password: string, passwordConfirmation: string) => {
      const newPassword = await updateMeMutation({ variables: { password, passwordConfirmation } });
      if (newPassword.errors) {
        setNotification({
          type: "error",
          text: intl.formatMessage({ defaultMessage: "Failed to update password." }),
        });
      } else {
        setNotification({
          type: "success",
          text: intl.formatMessage({ defaultMessage: "Successfully updated password!" }),
        });
      }
    },
    [updateMeMutation, intl, setNotification],
  );

  const updateLanguage = useCallback(
    async (lang: string) => {
      const language = await updateMeMutation({ variables: { lang } });
      if (language.errors) {
        setNotification({
          type: "error",
          text: intl.formatMessage({ defaultMessage: "Failed to change language." }),
        });
      } else {
        await client.resetStore();
      }
    },
    [updateMeMutation, intl, setNotification, client],
  );

  const updateTheme = useCallback(
    async (theme: string) => {
      const newTheme = await updateMeMutation({ variables: { theme: theme as Theme } });
      if (newTheme.errors) {
        setNotification({
          type: "error",
          text: intl.formatMessage({ defaultMessage: "Failed to change theme." }),
        });
      }
    },
    [updateMeMutation, intl, setNotification],
  );

  return {
    currentTeam,
    currentProject,
    me,
    hasPassword,
    passwordPolicy,
    updateName,
    updatePassword,
    updateLanguage,
    updateTheme,
  };
};
