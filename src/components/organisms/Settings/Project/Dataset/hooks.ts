import { useCallback } from "react";
import { useIntl } from "react-intl";
import {
  DatasetSchemasQuery,
  useSceneQuery,
  useDatasetSchemasQuery,
  useImportDatasetMutation,
  useRemoveDatasetMutation,
} from "@reearth/gql";
import { useApolloClient } from "@apollo/client";

import { useTeam, useProject } from "@reearth/state";
import useNotification from "@reearth/notifications/hooks";

type Nodes = NonNullable<DatasetSchemasQuery["scene"]>["datasetSchemas"]["nodes"];

type DatasetSchemas = NonNullable<Nodes[number]>[];

export default (projectId: string) => {
  const intl = useIntl();
  const [currentTeam] = useTeam();
  const [currentProject] = useProject();
  const { notify } = useNotification();

  const { data: sceneData } = useSceneQuery({
    variables: { projectId: projectId ?? "" },
    skip: !projectId,
  });

  const sceneId = sceneData?.scene?.id;

  const { data } = useDatasetSchemasQuery({
    variables: { projectId: projectId ?? "" },
    skip: !projectId,
  });

  const nodes = data?.scene?.datasetSchemas.nodes ?? [];

  const datasetSchemas = nodes.filter(Boolean) as DatasetSchemas;
  const client = useApolloClient();

  const [removeDatasetSchema] = useRemoveDatasetMutation();
  const handleRemoveDataset = useCallback(
    async (schemaId: string) => {
      const results = await removeDatasetSchema({
        variables: {
          schemaId,
          force: true,
        },
      });
      if (results.errors || results.data?.removeDatasetSchema) {
        notify("error", intl.formatMessage({ defaultMessage: "Failed to delete dataset." }));
      } else {
        notify("info", intl.formatMessage({ defaultMessage: "Dataset was successfully deleted." }));
        // re-render
        await client.resetStore();
      }
    },
    [client, removeDatasetSchema, notify, intl],
  );

  // Add
  const [importData] = useImportDatasetMutation();

  const handleDatasetImport = useCallback(
    async (file: File, schemeId: string | null) => {
      if (!sceneId) return;
      await importData({
        variables: {
          file,
          sceneId,
          datasetSchemaId: schemeId,
        },
      });
      // re-render
      await client.resetStore();
    },
    [client, importData, sceneId],
  );

  return {
    currentTeam,
    currentProject,
    datasetSchemas,
    handleDatasetImport,
    handleRemoveDataset,
  };
};
