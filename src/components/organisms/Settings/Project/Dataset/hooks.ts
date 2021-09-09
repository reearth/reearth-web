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

import { useTeam, useProject, useNotification } from "@reearth/state";

type Nodes = NonNullable<DatasetSchemasQuery["scene"]>["datasetSchemas"]["nodes"];

type DatasetSchemas = NonNullable<Nodes[number]>[];

export default (projectId: string) => {
  const intl = useIntl();
  const [currentTeam] = useTeam();
  const [currentProject] = useProject();
  const [, setNotification] = useNotification();

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
      if (results.errors) {
        setNotification({
          type: "error",
          text: intl.formatMessage({ defaultMessage: "Failed to delete dataset." }),
        });
      } else {
        setNotification({
          type: "info",
          text: intl.formatMessage({ defaultMessage: "Dataset was successfully deleted." }),
        });
        // re-render
        await client.resetStore();
      }
    },
    [client, removeDatasetSchema, setNotification, intl],
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
