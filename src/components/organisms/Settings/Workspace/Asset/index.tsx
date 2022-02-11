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
  const { currentProject, currentTeam, assetsData } = useHooks({ teamId });

  return (
    <SettingPage teamId={teamId} projectId={currentProject?.id}>
      <SettingsHeader
        title={intl.formatMessage({ defaultMessage: "Assets" })}
        currentWorkspace={currentTeam}
      />
      <AssetSection assetsData={assetsData} />
    </SettingPage>
  );
};

export default Asset;
