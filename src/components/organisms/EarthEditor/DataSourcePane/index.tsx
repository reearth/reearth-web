import React from "react";

import DatasetPane from "@reearth/components/molecules/EarthEditor/DatasetPane";

import useHooks from "./hooks";

// Components

interface Props {
  className?: string;
}

const DataSourcePane: React.FC<Props> = ({ className }) => {
  const {
    datasetSchemas,
    handleDatasetSync,
    handleDatasetImport,
    handleGoogleSheetDatasetImport,
    handleRemoveDataset,
    loading,
    onNotify,
    selectDatasetSchema,
    selectedDatasetSchemaId,
  } = useHooks();

  return (
    <DatasetPane
      className={className}
      datasetSchemas={datasetSchemas}
      onDatasetSync={handleDatasetSync}
      onGoogleSheetDatasetImport={handleGoogleSheetDatasetImport}
      onDatasetImport={handleDatasetImport}
      onRemoveDataset={handleRemoveDataset}
      loading={loading}
      onNotify={onNotify}
      selectDatasetSchema={selectDatasetSchema}
      selectedDatasetSchemaId={selectedDatasetSchemaId}
    />
  );
};

export default DataSourcePane;
