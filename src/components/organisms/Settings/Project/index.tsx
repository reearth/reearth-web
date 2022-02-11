import React from "react";

import ArchivedMessage from "@reearth/components/molecules/Settings/Project/ArchivedMessage";
import DangerSection from "@reearth/components/molecules/Settings/Project/DangerSection";
import ProfileSection from "@reearth/components/molecules/Settings/Project/ProfileSection";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import AssetsModal from "@reearth/components/organisms/Common/AssetModal";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";

import useHooks from "./hooks";

type Props = {
  projectId: string;
};

const Project: React.FC<Props> = ({ projectId }) => {
  const {
    project,
    currentTeam,
    updateProjectName,
    updateProjectDescription,
    updateProjectImageUrl,
    archiveProject,
    deleteProject,
    assetsModalOpened,
    toggleAssetsModal,
  } = useHooks({ projectId });

  return (
    <SettingPage teamId={currentTeam?.id} projectId={projectId}>
      <SettingsHeader currentWorkspace={currentTeam} currentProject={project?.name} />
      {!project?.isArchived ? (
        <ProfileSection
          currentProject={project}
          updateProjectName={updateProjectName}
          updateProjectDescription={updateProjectDescription}
          updateProjectImageUrl={updateProjectImageUrl}
          toggleAssetsModal={toggleAssetsModal}
          assetsModal={
            <AssetsModal
              teamId={currentTeam?.id}
              openAssets={assetsModalOpened}
              onSelect={updateProjectImageUrl}
              setOpenAssets={toggleAssetsModal}
            />
          }
        />
      ) : (
        <ArchivedMessage />
      )}
      <DangerSection
        project={project}
        teamId={currentTeam?.id}
        archiveProject={archiveProject}
        deleteProject={deleteProject}
      />
    </SettingPage>
  );
};

export default Project;
