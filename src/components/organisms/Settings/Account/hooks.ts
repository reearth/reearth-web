import { useCallback } from "react";
import { useIntl } from "react-intl";

import { useUpdateMeMutation, useProfileQuery } from "@reearth/gql";
import { useTeam, useProject } from "@reearth/state";
import useNotification from "@reearth/components/organisms/Notification/hooks";

export enum Theme {
  Default = "DEFAULT",
  Light = "LIGHT",
  Dark = "DARK",
}

export default () => {
  const intl = useIntl();
  const { notify } = useNotification();
  const [currentTeam] = useTeam();
  const [currentProject] = useProject();

  const { data: profileData } = useProfileQuery();
  const me = profileData?.me;
  const auths = profileData?.me?.auths;
  const hasPassword = auths?.includes("auth0") ?? false;

  const [updateMeMutation] = useUpdateMeMutation();

  const updateName = useCallback(
    async (name: string) => {
      const username = await updateMeMutation({ variables: { name } });
      if (username.errors || !username.data?.updateMe) {
        notify("error", intl.formatMessage({ defaultMessage: "Failed to update account name." }));
      }
    },
    [updateMeMutation, intl, notify],
  );

  const updatePassword = useCallback(
    async (password: string, passwordConfirmation: string) => {
      const newPassword = await updateMeMutation({ variables: { password, passwordConfirmation } });
      if (newPassword.errors || !newPassword.data?.updateMe) {
        notify("error", intl.formatMessage({ defaultMessage: "Failed to update password." }));
      } else {
        notify("success", intl.formatMessage({ defaultMessage: "Successfully updated password!" }));
      }
    },
    [updateMeMutation, intl, notify],
  );

  const updateLanguage = useCallback(
    async (lang: string) => {
      const language = await updateMeMutation({ variables: { lang } });
      if (language.errors || !language.data?.updateMe) {
        notify("error", intl.formatMessage({ defaultMessage: "Failed to change language." }));
      }
    },
    [updateMeMutation, intl, notify],
  );

  const updateTheme = useCallback(
    async (theme: string) => {
      const newTheme = await updateMeMutation({ variables: { theme: theme as Theme } });
      if (newTheme.errors || !newTheme.data?.updateMe) {
        notify("error", intl.formatMessage({ defaultMessage: "Failed to change theme." }));
      }
    },
    [updateMeMutation, intl, notify],
  );

  return {
    currentTeam,
    currentProject,
    me,
    hasPassword,
    updateName,
    updatePassword,
    updateLanguage,
    updateTheme,
  };
};
