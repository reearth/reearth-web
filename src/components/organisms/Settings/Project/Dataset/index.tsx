import React from "react";
import { useIntl } from "react-intl";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";
import DatasetSection from "@reearth/components/molecules/Settings/Project/Dataset/DatasetSection";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import ArchivedMessage from "@reearth/components/molecules/Settings/Project/ArchivedMessage";
import useHooks from "./hooks";

type Props = {
  projectId: string;
};

const Dataset: React.FC<Props> = ({ projectId }) => {
  const intl = useIntl();
  const { currentTeam, currentProject, datasetSchemas, importDataset, removeDatasetSchema } =
    useHooks(projectId);

  return (
    <SettingPage teamId={currentTeam?.id} projectId={projectId}>
      <SettingsHeader
        title={intl.formatMessage({ defaultMessage: "Dataset" })}
        currentProject={currentProject?.name}
      />
      {!currentProject?.isArchived ? (
        <DatasetSection
          datasetSchemas={datasetSchemas}
          importDataset={importDataset}
          removeDatasetSchema={removeDatasetSchema}
        />
      ) : (
        <ArchivedMessage />
      )}
    </SettingPage>
  );
};

export default Dataset;
