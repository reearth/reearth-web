import React, { useMemo } from "react";

import Button from "@reearth/components/atoms/Button";
import Loading from "@reearth/components/atoms/Loading";
import TabSection from "@reearth/components/atoms/TabSection";
import ProjectCreationModal from "@reearth/components/molecules/Common/ProjectCreationModal";
import MoleculeProjectList from "@reearth/components/molecules/Settings/ProjectList/ProjectList";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import AssetModal from "@reearth/components/organisms/Common/AssetModal";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";
import { useT } from "@reearth/i18n";

import useHooks from "./hooks";

type Props = {
  teamId: string;
};

const ProjectList: React.FC<Props> = ({ teamId }) => {
  const t = useT();
  const {
    loading,
    currentProjects,
    archivedProjects,
    projectLoading,
    hasMoreProjects,
    modalShown,
    openModal,
    handleModalClose,
    createProject,
    selectProject,
    selectedAsset,
    assetModalOpened,
    toggleAssetModal,
    onAssetSelect,
    handleGetMoreProjects,
  } = useHooks(teamId);

  const projectLength = useMemo(
    () => ({
      currentProjectsLength: currentProjects.length,
      archivedProjectsLength: archivedProjects.length,
    }),
    [currentProjects, archivedProjects],
  );

  const headers = {
    current: t("Current Projects") + "(" + projectLength.currentProjectsLength + ")",
    archived: t("Archived Projects") + "(" + projectLength.archivedProjectsLength + ")",
  };

  return (
    <SettingPage
      teamId={teamId}
      loading={projectLoading}
      hasMoreItems={hasMoreProjects}
      onScroll={handleGetMoreProjects}>
      <SettingsHeader title={t("Project List")} />
      <TabSection<"current" | "archived">
        menuAlignment="top"
        initialSelected="current"
        selected="current"
        expandedMenuIcon={false}
        headers={headers}
        headerAction={
          <Button large buttonType="secondary" text={t("New Project")} onClick={openModal} />
        }>
        {{
          current: (
            <MoleculeProjectList projects={currentProjects} onProjectSelect={selectProject} />
          ),
          archived: (
            <MoleculeProjectList
              projects={archivedProjects}
              archived
              onProjectSelect={selectProject}
            />
          ),
        }}
      </TabSection>
      <ProjectCreationModal
        open={modalShown}
        onClose={handleModalClose}
        onSubmit={createProject}
        toggleAssetModal={toggleAssetModal}
        selectedAsset={selectedAsset}
        assetModal={
          <AssetModal
            teamId={teamId}
            isOpen={assetModalOpened}
            onSelect={onAssetSelect}
            toggleAssetModal={toggleAssetModal}
          />
        }
      />
      {loading && <Loading portal overlay />}
    </SettingPage>
  );
};

export default ProjectList;
