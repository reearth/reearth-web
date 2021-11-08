import React from "react";

import { default as Wrapper } from "@reearth/components/molecules/EarthEditor/DatasetInfoPane";

import useHooks from "./hooks";

export type Props = {
  className?: string;
};

const DatasetInfoPane: React.FC<Props> = () => {
  const {
    datasetHeaders,
    datasets,
    primitiveItems,
    loading,
    handleAddLayerGroupFromDatasetSchema,
  } = useHooks();
  return (
    <Wrapper
      datasetHeaders={datasetHeaders}
      datasets={datasets}
      primitiveItems={primitiveItems}
      onCreateLayerGroup={handleAddLayerGroupFromDatasetSchema}
    />
  );
};

export default DatasetInfoPane;
