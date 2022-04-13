import React from "react";

import DatasetPane from "@reearth/components/molecules/EarthEditor/DatasetPane";

import useHooks from "./hooks";

interface Props {
  className?: string;
}

const DataSourcePane: React.FC<Props> = ({ className }) => {
  const {
    datasetSchemas,
    loading,
    selectedDatasetSchemaId,
    handleDatasetSync,
    handleDatasetImport,
    handleGoogleSheetDatasetImport,
    handleRemoveDataset,
    selectDatasetSchema,
    handleNotificationChange,
  } = useHooks();

  return (
    <DatasetPane
      className={className}
      datasetSchemas={datasetSchemas}
      loading={loading}
      selectedDatasetSchemaId={selectedDatasetSchemaId}
      onDatasetSync={handleDatasetSync}
      onGoogleSheetDatasetImport={handleGoogleSheetDatasetImport}
      onDatasetImport={handleDatasetImport}
      onRemoveDataset={handleRemoveDataset}
      selectDatasetSchema={selectDatasetSchema}
      onNotificationChange={handleNotificationChange}
    />
  );
};

export default DataSourcePane;
