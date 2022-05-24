import React, { useCallback, useState } from "react";

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
    totalCurrent,
    totalArchived,
    loadingProjects,
    loadingArchProjects,
    hasMoreProjects,
    hasMoreArchProjects,
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
    handleGetMoreArchProjects,
  } = useHooks(teamId);

  type Tab = "current" | "archived";
  const [selectedTab, setSelectedTab] = useState<Tab>("current");

  const headers = {
    current: t("Current Projects") + "(" + totalCurrent + ")",
    archived: t("Archived Projects") + "(" + totalArchived + ")",
  };
  const handleChangeTab = useCallback(
    (t: Tab) => {
      setSelectedTab(t);
    },
    [setSelectedTab],
  );
  return (
    <SettingPage
      teamId={teamId}
      loading={selectedTab === "current" ? loadingProjects : loadingArchProjects}
      hasMoreItems={selectedTab === "current" ? hasMoreProjects : hasMoreArchProjects}
      onScroll={selectedTab === "current" ? handleGetMoreProjects : handleGetMoreArchProjects}>
      <SettingsHeader title={t("Project List")} />
      <TabSection<Tab>
        menuAlignment="top"
        initialSelected={selectedTab}
        selected="current"
        expandedMenuIcon={false}
        headers={headers}
        onChange={handleChangeTab}
        headerAction={
          <Button large buttonType="secondary" text={t("New Project")} onClick={openModal} />
        }>
        {{
          current: (
            <MoleculeProjectList projects={currentProjects} onProjectSelect={selectProject} />
          ),
          archived: (
            <MoleculeProjectList projects={archivedProjects} onProjectSelect={selectProject} />
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
