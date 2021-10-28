import { useMemo } from "react";

import { useGetDatasetsQuery } from "@reearth/gql";
import { useSelected } from "@reearth/state";

import { processDataset, processDatasetNames } from "./convert";

// type DatasetSchemaFields = string[];

export default () => {
  const [selected, _] = useSelected();
  // const [sceneId] = useSceneId();

  // const { data: datasetSchemas, loading: datasetSchemaLoading } = useGetAllDataSetsQuery({
  //   variables: { sceneId: sceneId || "" },
  //   skip: !sceneId,
  // });

  const { data: rawDatasets, loading: datasetsLoading } = useGetDatasetsQuery({
    variables: {
      datasetSchemaId: selected?.type === "dataset" ? selected.datasetSchemaId : "",
      first: 100,
    },
    skip: selected?.type !== "dataset",
  });
  const datasets = useMemo(() => {
    return rawDatasets?.datasets?.nodes ? processDataset(rawDatasets?.datasets?.nodes as any) : [];
  }, [rawDatasets?.datasets.nodes]);

  const datasetSchemaFields = useMemo(() => {
    return rawDatasets?.datasets.nodes
      ? processDatasetNames(rawDatasets.datasets.nodes[0] as any)
      : [];
  }, [rawDatasets?.datasets.nodes]);

  return { datasets, datasetSchemaFields, loading: datasetsLoading };
};
