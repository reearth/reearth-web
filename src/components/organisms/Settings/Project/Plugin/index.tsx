import React from "react";
import { useIntl } from "react-intl";
import useHooks from "./hooks";

// Components
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import PluginSection from "@reearth/components/molecules/Settings/Workspace/Plugin/PluginSection";

type Props = {
  projectId: string;
};

const Plugin: React.FC<Props> = ({ projectId }) => {
  const intl = useIntl();
  const { currentTeam, currentProject, plugins, loading } = useHooks();

  return (
    <SettingPage projectId={projectId}>
      <SettingsHeader
        title={intl.formatMessage({ defaultMessage: "Plugins" })}
        currentWorkspace={currentTeam}
        currentProject={currentProject?.name}
      />
      <PluginSection
        plugins={plugins}
        loading={loading}
        // projects={currentProjects}
        // filterQuery={query}
        // onProjectSelect={selectProject}
        // onCreationButtonClick={openModal}
      />
    </SettingPage>
  );
};

export default Plugin;
