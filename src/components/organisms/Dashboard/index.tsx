import { useAuth } from "@reearth/auth";
import MoleculeHeader from "@reearth/components/molecules/Common/Header";
import MoleculeDashboard from "@reearth/components/molecules/Dashboard";
import Logo from "@reearth/components/molecules/Dashboard/Logo";
import MarketplaceButton from "@reearth/components/molecules/Dashboard/MarketplaceButton";
import ProjectList from "@reearth/components/molecules/Dashboard/ProjectList";
import QuickStart from "@reearth/components/molecules/Dashboard/QuickStart";
import Workspace from "@reearth/components/molecules/Dashboard/Workspace";
import AssetModal from "@reearth/components/organisms/Common/AssetModal";

import useHooks from "./hooks";

export type Props = {
  teamId?: string;
};

const Dashboard: React.FC<Props> = ({ teamId }) => {
  const { logout } = useAuth();

  const {
    user,
    projects,
    projectLoading,
    hasMoreProjects,
    teams,
    currentTeam,
    isPersonal,
    modalShown,
    selectedAsset,
    assetModalOpened,
    handleProjectCreate,
    handleTeamCreate,
    handleTeamChange,
    handleModalOpen,
    handleModalClose,
    handleAssetModalToggle,
    handleAssetSelect,
    handleGetMoreProjects,
  } = useHooks(teamId);

  return (
    <MoleculeDashboard
      header={
        <MoleculeHeader
          user={user}
          teams={teams}
          currentTeam={currentTeam}
          modalShown={modalShown}
          onSignOut={logout}
          onCreateTeam={handleTeamCreate}
          onChangeTeam={handleTeamChange}
          openModal={handleModalOpen}
          onModalClose={handleModalClose}
          dashboard
        />
      }
      isLoading={projectLoading}
      hasMoreProjects={hasMoreProjects}
      onGetMoreProjects={handleGetMoreProjects}>
      <Workspace team={currentTeam} isPersonal={isPersonal} />
      <QuickStart
        selectedAsset={selectedAsset}
        onCreateTeam={handleTeamCreate}
        onCreateProject={handleProjectCreate}
        onAssetSelect={handleAssetSelect}
        toggleAssetModal={handleAssetModalToggle}
        assetModal={
          <AssetModal
            teamId={teamId}
            initialAssetUrl={selectedAsset}
            isOpen={assetModalOpened}
            onSelect={handleAssetSelect}
            toggleAssetModal={handleAssetModalToggle}
          />
        }
      />
      <MarketplaceButton />
      <Logo />
      <ProjectList projects={projects} />
    </MoleculeDashboard>
  );
};

export default Dashboard;
