import React from "react";

import { default as Wrapper } from "@reearth/components/molecules/EarthEditor/DatasetInfoPane";

import useHooks from "./hooks";

export type Props = {
  className?: string;
};

const DatasetInfoPane: React.FC<Props> = () => {
  const { datasetHeaders, datasets, loading, primitiveItems } = useHooks();
  return (
    <Wrapper datasetHeaders={datasetHeaders} datasets={datasets} primitiveItems={primitiveItems} />
  );
};

export default DatasetInfoPane;
