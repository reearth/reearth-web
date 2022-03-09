import React from "react";
import { useIntl } from "react-intl";

import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import AssetSection from "@reearth/components/molecules/Settings/Workspace/Asset/AssetSection";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";

import useHooks from "./hooks";

type Props = {
  teamId: string;
};

const Asset: React.FC<Props> = ({ teamId }: Props) => {
  const intl = useIntl();
  const {
    currentProject,
    currentTeam,
    assets,
    isLoading,
    hasMoreAssets,
    sort,
    searchTerm,
    getMoreAssets,
    createAssets,
    handleSortChange,
    handleSearchTerm,
    removeAssets,
  } = useHooks({ teamId });

  return (
    <SettingPage teamId={teamId} projectId={currentProject?.id}>
      <SettingsHeader
        title={intl.formatMessage({ defaultMessage: "Assets" })}
        currentWorkspace={currentTeam}
      />
      <AssetSection
        assets={assets}
        isLoading={isLoading}
        hasMoreAssets={hasMoreAssets}
        sort={sort}
        searchTerm={searchTerm}
        getMoreAssets={getMoreAssets}
        onCreateAssets={createAssets}
        onSortChange={handleSortChange}
        onSearch={handleSearchTerm}
        onRemoveAssets={removeAssets}
      />
    </SettingPage>
  );
};

export default Asset;
