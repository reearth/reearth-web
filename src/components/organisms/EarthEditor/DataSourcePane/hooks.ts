import { useApolloClient } from "@apollo/client";
import { useMemo, useCallback } from "react";
import { useIntl } from "react-intl";

import { DatasetSchema, DataSource } from "@reearth/components/molecules/EarthEditor/DatasetPane";
import {
  useGetAllDataSetsQuery,
  useAddLayerGroupFromDatasetSchemaMutation,
  useSyncDatasetMutation,
  useImportDatasetMutation,
  useImportGoogleSheetDatasetMutation,
  useRemoveDatasetMutation,
} from "@reearth/gql";
import { useSceneId, useNotification, NotificationType } from "@reearth/state";

const pluginId = "reearth";
const extensionId = "marker";

export default () => {
  const intl = useIntl();
  const [, setNotification] = useNotification();
  const [sceneId] = useSceneId();
  const [addLayerGroupFromDatasetSchemaMutation] = useAddLayerGroupFromDatasetSchemaMutation();

  const { data, loading } = useGetAllDataSetsQuery({
    variables: { sceneId: sceneId || "" },
    skip: !sceneId,
  });

  const onNotify = useCallback(
    (type?: NotificationType, text?: string) => {
      if (!type || !text) return;
      setNotification({
        type,
        text,
      });
    },
    [setNotification],
  );

  const datasetMessageSuccess = intl.formatMessage({
    defaultMessage: "Successfully added a dataset!",
  });
  const datasetMessageFailure = intl.formatMessage({ defaultMessage: "Failed to add dataset" });

  const datasetSchemas = useMemo(
    () =>
      data
        ? data.datasetSchemas.nodes
            .map<DatasetSchema | undefined>(n =>
              n
                ? {
                    id: n.id,
                    name: n.name,
                    source: n.source as DataSource,
                    totalCount: n.datasets.totalCount,
                    onDrop: async (layerId: string, index?: number) => {
                      await addLayerGroupFromDatasetSchemaMutation({
                        variables: {
                          parentLayerId: layerId,
                          datasetSchemaId: n.id,
                          pluginId,
                          extensionId,
                          index,
                        },
                        refetchQueries: ["GetLayers"],
                      });
                    },
                  }
                : undefined,
            )
            .filter((e): e is DatasetSchema => !!e)
        : [],
    [addLayerGroupFromDatasetSchemaMutation, data],
  );

  // dataset sync
  const client = useApolloClient();
  const [syncData] = useSyncDatasetMutation();

  const handleDatasetSync = useCallback(
    async (value: string) => {
      if (!sceneId) return;
      await syncData({
        variables: { sceneId, url: value },
      });
      // re-render
      await client.resetStore();
    },
    [client, sceneId, syncData],
  );

  const [importData] = useImportDatasetMutation();

  const handleDatasetImport = useCallback(
    async (file: File, schemeId: string | null) => {
      if (!sceneId) return;
      const result = await importData({
        variables: {
          file,
          sceneId,
          datasetSchemaId: schemeId,
        },
      });

      if (result.errors) {
        onNotify?.("error", datasetMessageFailure);
      } else {
        onNotify?.("success", datasetMessageSuccess);
      }
      // re-render
      await client.resetStore();
    },
    [client, importData, sceneId, onNotify, datasetMessageSuccess, datasetMessageFailure],
  );

  const [importGoogleSheetData] = useImportGoogleSheetDatasetMutation();

  const handleGoogleSheetDatasetImport = useCallback(
    async (accessToken: string, fileId: string, sheetName: string, schemeId: string | null) => {
      if (!sceneId) return;
      const result = await importGoogleSheetData({
        variables: {
          accessToken,
          fileId,
          sheetName,
          sceneId,
          datasetSchemaId: schemeId,
        },
      });
      if (result.errors) {
        onNotify?.("error", datasetMessageFailure);
      } else {
        onNotify?.("success", datasetMessageSuccess);
      }
      // re-render
      await client.resetStore();
    },
    [
      client,
      importGoogleSheetData,
      sceneId,
      onNotify,
      datasetMessageFailure,
      datasetMessageSuccess,
    ],
  );

  const [removeDatasetSchema] = useRemoveDatasetMutation();
  const handleRemoveDataset = useCallback(
    async (schemaId: string) => {
      await removeDatasetSchema({
        variables: {
          schemaId,
          force: true,
        },
      });
      // re-render
      await client.resetStore();
    },
    [client, removeDatasetSchema],
  );

  return {
    datasetSchemas,
    handleDatasetSync,
    handleDatasetImport,
    handleGoogleSheetDatasetImport,
    handleRemoveDataset,
    loading,
    onNotify,
  };
};
