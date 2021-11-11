import { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import {
  useAddLayerGroupFromDatasetSchemaMutation,
  useGetDatasetsForDatasetInfoPaneQuery,
  useGetScenePluginsForDatasetInfoPaneQuery,
} from "@reearth/gql";
import { useProject, useRootLayerId, useSelected } from "@reearth/state";

import { processDatasets, processDatasetHeaders, processPrimitives } from "./convert";

export default () => {
  const [selected] = useSelected();
  const [project] = useProject();
  const [addLayerGroupFromDatasetSchemaMutation] = useAddLayerGroupFromDatasetSchemaMutation();
  const selectedDatasetSchemaId = selected?.type === "dataset" ? selected.datasetSchemaId : "";
  const [rootLayerId, _] = useRootLayerId();

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

  const primitiveItems = useMemo(() => {
    const plugins = rawScene?.scene?.plugins.map(p => p.plugin);
    return plugins ? processPrimitives(plugins) : [];
  }, [rawScene?.scene?.plugins]);

  const handleAddLayerGroupFromDatasetSchema = useCallback(
    async (pluginId: string, extensionId: string) => {
      if (!rootLayerId || !selectedDatasetSchemaId) return;
      await addLayerGroupFromDatasetSchemaMutation({
        variables: {
          parentLayerId: rootLayerId,
          datasetSchemaId: selectedDatasetSchemaId,
          pluginId,
          extensionId,
        },
        refetchQueries: ["GetLayers"],
      });
    },
    [addLayerGroupFromDatasetSchemaMutation, rootLayerId, selectedDatasetSchemaId],
  );

  return {
    datasets,
    datasetHeaders,
    loading: datasetsLoading || scenePluginLoading,
    primitiveItems,
    handleAddLayerGroupFromDatasetSchema,
  };
};
