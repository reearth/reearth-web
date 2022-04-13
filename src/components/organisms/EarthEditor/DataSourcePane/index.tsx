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
    />
  );
};

export default DataSourcePane;
