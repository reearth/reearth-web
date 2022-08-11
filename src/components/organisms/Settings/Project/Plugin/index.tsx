import React from "react";

import ArchivedMessage from "@reearth/components/molecules/Settings/Project/ArchivedMessage";
import PluginSection from "@reearth/components/molecules/Settings/Project/Plugin/PluginSection";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";
import { useT } from "@reearth/i18n";

import useHooks from "./hooks";

// Components

type Props = {
  projectId: string;
};

const Plugin: React.FC<Props> = ({ projectId }) => {
  const t = useT();
  const {
    currentProject,
    installedPlugins,
    loading,
    extensions,
    accessToken,
    installFromPublicRepo,
    installByUploadingZipFile,
    uninstallPlugin,
  } = useHooks(projectId);

  return (
    <SettingPage projectId={projectId}>
      <SettingsHeader title={t("Plugins")} currentProject={currentProject?.name} />
      {!currentProject?.isArchived ? (
        <PluginSection
          loading={loading}
          installedPlugins={installedPlugins}
          extensions={extensions}
          accessToken={accessToken}
          installFromPublicRepo={installFromPublicRepo}
          installByUploadingZipFile={installByUploadingZipFile}
          uninstallPlugin={uninstallPlugin}
        />
      ) : (
        <ArchivedMessage />
      )}
    </SettingPage>
  );
};

export default Plugin;
