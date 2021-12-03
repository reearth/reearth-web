import React from "react";

import ArchivedMessage from "@reearth/components/molecules/Settings/Project/ArchivedMessage";
import DangerSection from "@reearth/components/molecules/Settings/Project/DangerSection";
import ProfileSection from "@reearth/components/molecules/Settings/Project/ProfileSection";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import AssetsContainer from "@reearth/components/organisms/Common/AssetsContainer";
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
    selectedAsset,
    resetAssetSelect,
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
          selectedAsset={selectedAsset}
          resetAssetSelect={resetAssetSelect}
          assetsContainer={
            currentTeam && (
              <AssetsContainer
                teamId={currentTeam?.id}
                url={project?.imageUrl ?? undefined}
                allowedAssetType="image"
                creationEnabled
                height={425}
              />
            )
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
