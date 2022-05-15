import React from "react";
import { useIntl } from "react-intl";

import ArchivedMessage from "@reearth/components/molecules/Settings/Project/ArchivedMessage";
import DatasetSection from "@reearth/components/molecules/Settings/Project/Dataset/DatasetSection";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";

import useHooks from "./hooks";

type Props = {
  projectId: string;
};

const Dataset: React.FC<Props> = ({ projectId }) => {
  const intl = useIntl();
  const {
    currentTeam,
    currentProject,
    datasetSchemas,
    dataSetLoading,
    hasMoreDataSets,
    handleRemoveDataset,
    handleDatasetImport,
    getMoreDataSets,
  } = useHooks(projectId);

  return (
    <SettingPage
      teamId={currentTeam?.id}
      projectId={projectId}
      loading={dataSetLoading}
      hasMoreItems={hasMoreDataSets}
      handleScrolling={getMoreDataSets}>
      <SettingsHeader
        title={intl.formatMessage({ defaultMessage: "Dataset" })}
        currentProject={currentProject?.name}
      />
      {!currentProject?.isArchived ? (
        <DatasetSection
          datasetSchemas={datasetSchemas}
          removeDatasetSchema={handleRemoveDataset}
          onDatasetImport={handleDatasetImport}
        />
      ) : (
        <ArchivedMessage />
      )}
    </SettingPage>
  );
};

export default Dataset;
