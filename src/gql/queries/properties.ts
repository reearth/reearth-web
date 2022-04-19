import { gql } from "@apollo/client";

import { propertyFragment, layerFragment } from "@reearth/gql/fragments";

export const CHANGE_PROPERTY_VALUE = gql`
  mutation ChangePropertyValue(
    $value: Any
    $propertyId: ID!
    $schemaGroupId: PropertySchemaGroupID
    $itemId: ID
    $fieldId: PropertySchemaFieldID!
    $type: ValueType!
    $lang: String
  ) {
    updatePropertyValue(
      input: {
        propertyId: $propertyId
        schemaGroupId: $schemaGroupId
        itemId: $itemId
        fieldId: $fieldId
        value: $value
        type: $type
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

export const UPLOAD_FILE_TO_PROPERTY = gql`
  mutation UploadFileToProperty(
    $propertyId: ID!
    $schemaGroupId: PropertySchemaGroupID
    $itemId: ID
    $fieldId: PropertySchemaFieldID!
    $file: Upload!
    $lang: String
  ) {
    uploadFileToProperty(
      input: {
        propertyId: $propertyId
        schemaGroupId: $schemaGroupId
        itemId: $itemId
        fieldId: $fieldId
        file: $file
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

export const REMOVE_FIELD = gql`
  mutation RemovePropertyField(
    $propertyId: ID!
    $schemaGroupId: PropertySchemaGroupID
    $itemId: ID
    $fieldId: PropertySchemaFieldID!
    $lang: String
  ) {
    removePropertyField(
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

export const ADD_PROPERTY_ITEM = gql`
  mutation addPropertyItem(
    $propertyId: ID!
    $schemaGroupId: PropertySchemaGroupID!
    $index: Int
    $nameFieldValue: Any
    $nameFieldType: ValueType
    $lang: String
  ) {
    addPropertyItem(
      input: {
        propertyId: $propertyId
        schemaGroupId: $schemaGroupId
        index: $index
        nameFieldValue: $nameFieldValue
        nameFieldType: $nameFieldType
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

export const MOVE_PROPERTY_ITEM = gql`
  mutation movePropertyItem(
    $propertyId: ID!
    $schemaGroupId: PropertySchemaGroupID!
    $itemId: ID!
    $index: Int!
    $lang: String
  ) {
    movePropertyItem(
      input: {
        propertyId: $propertyId
        schemaGroupId: $schemaGroupId
        itemId: $itemId
        index: $index
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

export const REMOVE_PROPERTY_ITEM = gql`
  mutation removePropertyItem(
    $propertyId: ID!
    $schemaGroupId: PropertySchemaGroupID!
    $itemId: ID!
    $lang: String
  ) {
    removePropertyItem(
      input: { propertyId: $propertyId, schemaGroupId: $schemaGroupId, itemId: $itemId }
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

export const UPDATE_PROPERTY_ITEMS = gql`
  mutation updatePropertyItems(
    $propertyId: ID!
    $schemaGroupId: PropertySchemaGroupID!
    $operations: [UpdatePropertyItemOperationInput!]!
    $lang: String
  ) {
    updatePropertyItems(
      input: { propertyId: $propertyId, schemaGroupId: $schemaGroupId, operations: $operations }
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

export const GET_LAYER_PROPERTY = gql`
  query GetLayerProperty($layerId: ID!, $lang: String) {
    layer(id: $layerId) {
      id
      ...Layer1Fragment
    }
  }

  ${propertyFragment}
`;

export const GET_SCENE_PROPERTY = gql`
  query GetSceneProperty($sceneId: ID!, $lang: String) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        property {
          id
          ...PropertyFragment
        }
        widgets {
          id
          pluginId
          extensionId
          enabled
          propertyId
          property {
            id
            ...PropertyFragment
          }
        }
        clusters {
          id
          name
          propertyId
          property {
            id
            ...PropertyFragment
          }
        }
      }
    }
  }

  ${propertyFragment}
`;
