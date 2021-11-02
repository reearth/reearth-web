import React from "react";

import { default as Wrapper } from "@reearth/components/molecules/EarthEditor/DatasetInfoPane";

import useHooks from "./hooks";

export type Props = {
  className?: string;
};

const DatasetInfoPane: React.FC<Props> = () => {
  const { datasetHeaders, datasets, loading } = useHooks();
  return <Wrapper datasetHeaders={datasetHeaders} datasets={datasets} />;
};

export default DatasetInfoPane;
