import { gql } from "@apollo/client";

export const GET_DATASETS = gql`
  query GetDatasetsForDatasetInfoPane(
    $datasetSchemaId: ID!
    $first: Int
    $last: Int
    $after: Cursor
    $before: Cursor
  ) {
    datasets(
      datasetSchemaId: $datasetSchemaId
      first: $first
      last: $last
      after: $after
      before: $before
    ) {
      nodes {
        ...DatasetFragment
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
`;

export const GET_INSTALLED_PLUGINS = gql`
  query GetScenePluginsForDatasetInfoPane($projectId: ID!) {
    scene(projectId: $projectId) {
      plugins {
        pluginId
        plugin {
          name
          extensions {
            extensionId
            type
            name
            description
            icon
            translatedName
          }
        }
      }
    }
  }
`;
