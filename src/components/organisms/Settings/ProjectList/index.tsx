import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Loading from "@reearth/components/atoms/Loading";
import TabMenu from "@reearth/components/atoms/TabMenu";
import ProjectCreationModal from "@reearth/components/molecules/Common/ProjectCreationModal";
import MoleculeProjectList from "@reearth/components/molecules/Settings/ProjectList/ProjectList";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import AssetModal from "@reearth/components/organisms/Common/AssetModal";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";

import useHooks from "./hooks";

type Props = {
  teamId: string;
};

const ProjectList: React.FC<Props> = ({ teamId }) => {
  const intl = useIntl();
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
    getMoreProjects,
  } = useHooks(teamId);

  const projectLength = useMemo(
    () => ({
      currentProjectsLength: currentProjects.length || 0,
      archivedProjectsLength: archivedProjects.length || 0,
    }),
    [currentProjects, archivedProjects],
  );

  const headers = {
    current:
      intl.formatMessage({
        defaultMessage: "Current Projects ",
      }) +
      "(" +
      projectLength.currentProjectsLength +
      ")",
    archived:
      intl.formatMessage({
        defaultMessage: "Archived Projects ",
      }) +
      "(" +
      projectLength.archivedProjectsLength +
      ")",
  };

  return (
    <SettingPage
      teamId={teamId}
      loading={projectLoading}
      hasMoreItems={hasMoreProjects}
      handleScrolling={getMoreProjects}>
      <SettingsHeader title={intl.formatMessage({ defaultMessage: "Project List" })} />
      <TabMenu<"current" | "archived">
        menuAlignment="top"
        initialSelected="current"
        selected="current"
        expandedMenuIcon={false}
        headers={headers}
        headerAction={
          <Button
            large
            buttonType="secondary"
            text={intl.formatMessage({ defaultMessage: "New Project" })}
            onClick={openModal}
          />
        }>
        {{
          current: (
            <MoleculeProjectList
              projects={currentProjects}
              onProjectSelect={selectProject}
              withToggle={false}
            />
          ),
          archived: (
            <MoleculeProjectList
              projects={archivedProjects}
              archived
              onProjectSelect={selectProject}
              withToggle={false}
            />
          ),
        }}
      </TabMenu>
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
