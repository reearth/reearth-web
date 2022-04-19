import { gql } from "@apollo/client";

import { layerFragment } from "@reearth/gql/fragments";

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
        id
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

export const DATASET_SCHEMAS = gql`
  query datasetSchemas($projectId: ID!, $first: Int, $last: Int, $after: Cursor, $before: Cursor) {
    scene(projectId: $projectId) {
      id
      datasetSchemas(first: $first, last: $last, after: $after, before: $before) {
        nodes {
          id
          source
          name
        }
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
        totalCount
      }
    }
  }
`;

export const GET_LINKABLE_DATASETS = gql`
  query GetLinkableDatasets($sceneId: ID!) {
    datasetSchemas(sceneId: $sceneId, first: 100) {
      nodes {
        id
        source
        name
        fields {
          id
          name
          type
        }
        datasets(first: 100) {
          totalCount
          nodes {
            id
            name
            fields {
              fieldId
              type
            }
          }
        }
      }
    }
  }

  ${layerFragment}
`;

export const LINK_DATASET = gql`
  mutation LinkDataset(
    $propertyId: ID!
    $itemId: ID
    $schemaGroupId: PropertySchemaGroupID
    $fieldId: PropertySchemaFieldID!
    $datasetSchemaIds: [ID!]!
    $datasetIds: [ID!]
    $datasetFieldIds: [ID!]!
    $lang: String
  ) {
    linkDatasetToPropertyValue(
      input: {
        propertyId: $propertyId
        itemId: $itemId
        schemaGroupId: $schemaGroupId
        fieldId: $fieldId
        datasetSchemaIds: $datasetSchemaIds
        datasetIds: $datasetIds
        datasetSchemaFieldIds: $datasetFieldIds
      }
    ) {
      property {
        id
        ...PropertyFragment
      }
    }
  }
`;

export const UNLINK_DATASET = gql`
  mutation UnlinkDataset(
    $propertyId: ID!
    $schemaGroupId: PropertySchemaGroupID
    $itemId: ID
    $fieldId: PropertySchemaFieldID!
    $lang: String
  ) {
    unlinkPropertyValue(
      input: {
        propertyId: $propertyId
        schemaGroupId: $schemaGroupId
        itemId: $itemId
        fieldId: $fieldId
      }
    ) {
      property {
        id
        ...PropertyFragment
        layer {
          id
          ...Layer1Fragment
        }
      }
    }
  }

  ${layerFragment}
`;

export const ADD_LAYER_GROUP_FROM_DATASET_SCHEMA = gql`
  mutation addLayerGroupFromDatasetSchema(
    $parentLayerId: ID!
    $pluginId: PluginID
    $extensionId: PluginExtensionID
    $datasetSchemaId: ID
    $lang: String
  ) {
    addLayerGroup(
      input: {
        parentLayerId: $parentLayerId
        pluginId: $pluginId
        extensionId: $extensionId
        linkedDatasetSchemaID: $datasetSchemaId
      }
    ) {
      layer {
        id
        ...Layer1Fragment
      }
      parentLayer {
        id
        ...Layer0Fragment
      }
    }
  }
  ${layerFragment}
`;

export const SYNC_DATASET = gql`
  mutation SyncDataset($sceneId: ID!, $url: String!) {
    syncDataset(input: { sceneId: $sceneId, url: $url }) {
      sceneId
      url
      datasetSchema {
        id
        source
        name
      }
      dataset {
        id
        source
        schemaId
        name
      }
    }
  }
`;

export const IMPORT_GOOGLE_SHEET_DATASET = gql`
  mutation importGoogleSheetDataset(
    $accessToken: String!
    $fileId: String!
    $sheetName: String!
    $sceneId: ID!
    $datasetSchemaId: ID
  ) {
    importDatasetFromGoogleSheet(
      input: {
        accessToken: $accessToken
        fileId: $fileId
        sheetName: $sheetName
        sceneId: $sceneId
        datasetSchemaId: $datasetSchemaId
      }
    ) {
      datasetSchema {
        id
        name
      }
    }
  }
`;

export const IMPORT_DATASET = gql`
  mutation importDataset($file: Upload!, $sceneId: ID!, $datasetSchemaId: ID) {
    importDataset(input: { file: $file, sceneId: $sceneId, datasetSchemaId: $datasetSchemaId }) {
      datasetSchema {
        id
        name
      }
    }
  }
`;

export const REMOVE_DATASET = gql`
  mutation RemoveDataset($schemaId: ID!, $force: Boolean) {
    removeDatasetSchema(input: { schemaId: $schemaId, force: $force }) {
      schemaId
    }
  }
`;

export const REMOVE_DATASET_SCHEMA = gql`
  mutation removeDatasetSchema($schemaId: ID!) {
    removeDatasetSchema(input: { schemaId: $schemaId }) {
      schemaId
    }
  }
`;
