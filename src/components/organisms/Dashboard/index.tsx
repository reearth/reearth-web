import React from "react";

import { useAuth } from "@reearth/auth";
import MoleculeHeader from "@reearth/components/molecules/Common/Header";
import MoleculeDashboard from "@reearth/components/molecules/Dashboard";
import Logo from "@reearth/components/molecules/Dashboard/Logo";
import ProjectList from "@reearth/components/molecules/Dashboard/ProjectList";
import QuickStart from "@reearth/components/molecules/Dashboard/QuickStart";
import Workspace from "@reearth/components/molecules/Dashboard/Workspace";
import AssetsContainer from "@reearth/components/organisms/Common/AssetsContainer";

import useHooks from "./hooks";

export type Props = {
  teamId: string;
};

const Dashboard: React.FC<Props> = ({ teamId }) => {
  const { logout } = useAuth();

  const {
    user,
    projects,
    createProject,
    teams = [],
    currentTeam,
    createTeam,
    changeTeam,
    modalShown,
    openModal,
    handleModalClose,
    selectedAsset,
    handleAssetSelect,
  } = useHooks(teamId);

  return (
    <MoleculeDashboard
      header={
        <MoleculeHeader
          user={user}
          teams={teams}
          currentTeam={currentTeam}
          onSignOut={logout}
          onCreateTeam={createTeam}
          onChangeTeam={changeTeam}
          modalShown={modalShown}
          openModal={openModal}
          handleModalClose={handleModalClose}
          dashboard
        />
      }>
      <Workspace team={currentTeam} />
      <QuickStart
        onCreateTeam={createTeam}
        onCreateProject={createProject}
        selectedAsset={selectedAsset}
        onAssetSelect={handleAssetSelect}
        assetsContainer={
          <AssetsContainer teamId={teamId} allowedAssetType="image" creationEnabled height={425} />
        }
      />
      <Logo />
      <ProjectList projects={projects} />
    </MoleculeDashboard>
  );
};

export default Dashboard;
