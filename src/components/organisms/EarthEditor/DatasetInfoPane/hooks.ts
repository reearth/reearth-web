import { useMemo } from "react";

import { useGetDatasetsQuery } from "@reearth/gql";
import { useSelected } from "@reearth/state";

import { processDatasets, processDatasetHeaders } from "./convert";

export default () => {
  const [selected] = useSelected();

  const { data: rawDatasets, loading: datasetsLoading } = useGetDatasetsQuery({
    variables: {
      datasetSchemaId: selected?.type === "dataset" ? selected.datasetSchemaId : "",
      first: 10,
    },
    skip: selected?.type !== "dataset",
  });

  const datasets = useMemo(() => {
    return rawDatasets?.datasets?.nodes ? processDatasets(rawDatasets?.datasets?.nodes) : [];
  }, [rawDatasets?.datasets.nodes]);

  const datasetHeaders = useMemo(() => {
    return rawDatasets?.datasets.nodes ? processDatasetHeaders(rawDatasets.datasets.nodes) : [];
  }, [rawDatasets?.datasets.nodes]);

  return { datasets, datasetHeaders, loading: datasetsLoading };
};
