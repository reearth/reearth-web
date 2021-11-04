import { useMemo } from "react";

import {
  useGetDatasetsForDatasetInfoPaneQuery,
  useGetScenePluginsForDatasetInfoPaneQuery,
} from "@reearth/gql";
import { useProject, useSelected } from "@reearth/state";

import { processDatasets, processDatasetHeaders, processPrimitives } from "./convert";

export default () => {
  const [selected] = useSelected();
  const [project] = useProject();

  const { data: rawDatasets, loading: datasetsLoading } = useGetDatasetsForDatasetInfoPaneQuery({
    variables: {
      datasetSchemaId: selected?.type === "dataset" ? selected.datasetSchemaId : "",
      first: 10,
    },
    skip: selected?.type !== "dataset",
  });

  const { data: rawScene, loading: scenePluginLoading } = useGetScenePluginsForDatasetInfoPaneQuery(
    {
      variables: {
        projectId: project?.id ? project.id : "",
      },
      skip: !project?.id,
    },
  );

  const datasets = useMemo(() => {
    return rawDatasets?.datasets?.nodes ? processDatasets(rawDatasets?.datasets?.nodes) : [];
  }, [rawDatasets?.datasets.nodes]);

  const datasetHeaders = useMemo(() => {
    return rawDatasets?.datasets.nodes ? processDatasetHeaders(rawDatasets.datasets.nodes) : [];
  }, [rawDatasets?.datasets.nodes]);

  // const [sceneId] = useSceneId();

  // const { data: datasetSchemas, loading: datasetSchemaLoading } = useGetAllDataSetsQuery({
  //   variables: { sceneId: sceneId || "" },
  //   skip: !sceneId,
  // });

  // console.log(datasetSchemas);
  const primitiveTypes = useMemo(() => {
    return rawScene?.scene?.plugins ? processPrimitives(rawScene?.scene?.plugins) : [];
  }, [rawScene?.scene?.plugins]);

  return { datasets, datasetHeaders, loading: datasetsLoading };
};
