import React from "react";

import { default as Wrapper } from "@reearth/components/molecules/EarthEditor/DatasetInfoPane";

import useHooks from "./hooks";

export type Props = {
  className?: string;
};

const DatasetInfoPane: React.FC<Props> = () => {
  const { datasetSchemaFields, datasets, loading } = useHooks();
  console.log(datasetSchemaFields, datasets, loading);
  return <Wrapper>hoge</Wrapper>;
};

export default DatasetInfoPane;
