import { gql } from "@apollo/client";

import { layerFragment, propertyFragment } from "@reearth/gql/fragments";

const fragments = gql`
  fragment EarthLayerItem on LayerItem {
    id
    linkedDatasetId
    scenePlugin {
      property {
        id
        ...PropertyFragment
      }
    }
    merged {
      parentId
      property {
        ...MergedPropertyFragmentWithoutSchema
      }
      infobox {
        property {
          ...MergedPropertyFragmentWithoutSchema
        }
        fields {
          originalId
          pluginId
          extensionId
          property {
            ...MergedPropertyFragmentWithoutSchema
          }
          scenePlugin {
            property {
              id
              ...PropertyFragment
            }
          }
        }
      }
    }
  }

  fragment EarthLayer on Layer {
    id
    name
    isVisible
    pluginId
    extensionId
    scenePlugin {
      property {
        id
        ...PropertyFragment
      }
    }
    property {
      id
      ...PropertyFragmentWithoutSchema
    }
    infobox {
      propertyId
      property {
        id
        ...PropertyFragmentWithoutSchema
      }
      fields {
        id
        pluginId
        extensionId
        propertyId
        scenePlugin {
          property {
            id
            ...PropertyFragment
          }
        }
        property {
          id
          ...PropertyFragmentWithoutSchema
        }
      }
    }
    ... on LayerGroup {
      linkedDatasetSchemaId
      layers {
        id
      }
    }
    ...EarthLayerItem
  }

  fragment EarthLayer1 on Layer {
    id
    ...EarthLayer
    ... on LayerGroup {
      layers {
        id
        ...EarthLayer
      }
    }
  }

  fragment EarthLayer2 on Layer {
    id
    ...EarthLayer
    ... on LayerGroup {
      layers {
        id
        ...EarthLayer1
      }
    }
  }

  fragment EarthLayer3 on Layer {
    id
    ...EarthLayer
    ... on LayerGroup {
      layers {
        id
        ...EarthLayer2
      }
    }
  }

  fragment EarthLayer4 on Layer {
    id
    ...EarthLayer
    ... on LayerGroup {
      layers {
        id
        ...EarthLayer3
      }
    }
  }

  fragment EarthLayer5 on Layer {
    id
    ...EarthLayer
    ... on LayerGroup {
      layers {
        id
        ...EarthLayer4
      }
    }
  }

  ${propertyFragment}
`;

export const GET_LAYERS = gql`
  query GetLayers($sceneId: ID!) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        rootLayer {
          id
          ...EarthLayer5
        }
      }
    }
  }

  ${fragments}
`;

export const GET_EARTH_WIDGETS = gql`
  query GetEarthWidgets($sceneId: ID!) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        project {
          id
          publicTitle
        }
        property {
          id
          ...PropertyFragment
        }
        widgets {
          id
          enabled
          pluginId
          extensionId
          plugin {
            id
            scenePlugin(sceneId: $sceneId) {
              property {
                id
                ...PropertyFragment
              }
            }
          }
          property {
            id
            ...PropertyFragment
          }
        }
      }
    }
  }

  ${fragments}
`;

export const MOVE_INFOBOX_FIELD = gql`
  mutation moveInfoboxField($layerId: ID!, $infoboxFieldId: ID!, $index: Int!) {
    moveInfoboxField(input: { layerId: $layerId, infoboxFieldId: $infoboxFieldId, index: $index }) {
      layer {
        id
        ...EarthLayer
      }
    }
  }

  ${layerFragment}
`;

export const REMOVE_INFOBOX_FIELD = gql`
  mutation removeInfoboxField($layerId: ID!, $infoboxFieldId: ID!) {
    removeInfoboxField(input: { layerId: $layerId, infoboxFieldId: $infoboxFieldId }) {
      layer {
        id
        ...LayerFragment
      }
    }
  }

  ${layerFragment}
`;

export const GET_BLOCKS = gql`
  query getBlocks($sceneId: ID!) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        plugins {
          plugin {
            id
            extensions {
              extensionId
              type
              name
              description
              icon
            }
          }
        }
      }
    }
  }
`;

export const ADD_INFOBOX_FIELD = gql`
  mutation addInfoboxField(
    $layerId: ID!
    $pluginId: PluginID!
    $extensionId: PluginExtensionID!
    $index: Int
  ) {
    addInfoboxField(
      input: { layerId: $layerId, pluginId: $pluginId, extensionId: $extensionId, index: $index }
    ) {
      layer {
        id
        ...LayerFragment
      }
    }
  }

  ${layerFragment}
`;

export const UPDATE_LAYER_LATLNG = gql`
  mutation ChangePropertyValueLatLng(
    $propertyId: ID!
    $schemaItemId: PropertySchemaFieldID
    $itemId: ID
    $fieldId: PropertySchemaFieldID!
    $lat: Float!
    $lng: Float!
  ) {
    updatePropertyValueLatLng(
      input: {
        propertyId: $propertyId
        schemaItemId: $schemaItemId
        itemId: $itemId
        fieldId: $fieldId
        lat: $lat
        lng: $lng
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

export const GET_LAYER_PROPERTY = gql`
  query GetLayerProperty($layerId: ID!) {
    layer(id: $layerId) {
      id
      ...Layer1Fragment
    }
  }
`;
