import React from "react";
import MoleculeHeader from "@reearth/components/molecules/Common/Header";
import MoleculeDashboard from "@reearth/components/molecules/Dashboard";
import Workspace from "@reearth/components/molecules/Dashboard/Workspace";
import QuickStart from "@reearth/components/molecules/Dashboard/QuickStart";
import Logo from "@reearth/components/molecules/Dashboard/Logo";
import ProjectList from "@reearth/components/molecules/Dashboard/ProjectList";
import useHooks from "./hooks";
import { useAuth } from "@reearth/auth";

export type Props = {
  teamId?: string;
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
    createAssets,
    assets,
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
        assets={assets}
        createAssets={createAssets}
      />
      <Logo />
      <ProjectList projects={projects} />
    </MoleculeDashboard>
  );
};

export default Dashboard;
