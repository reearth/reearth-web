import { gql } from "@apollo/client";

import { layerFragment, infoboxFragment } from "@reearth/gql/fragments";

export const GET_BLOCKS = gql`
  query getBlocks($sceneId: ID!, $lang: String) {
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
              translatedName(lang: $lang)
              translatedDescription(lang: $lang)
              icon
            }
          }
        }
      }
    }
  }
`;

export const CREATE_INFOBOX = gql`
  mutation createInfobox($layerId: ID!, $lang: String) {
    createInfobox(input: { layerId: $layerId }) {
      layer {
        id
        infobox {
          ...InfoboxFragment
        }
        ... on LayerItem {
          merged {
            infobox {
              ...MergedInfoboxFragment
            }
          }
        }
      }
    }
  }

  ${infoboxFragment}
`;

export const REMOVE_INFOBOX = gql`
  mutation removeInfobox($layerId: ID!, $lang: String) {
    removeInfobox(input: { layerId: $layerId }) {
      layer {
        id
        infobox {
          ...InfoboxFragment
        }
        ... on LayerItem {
          merged {
            infobox {
              ...MergedInfoboxFragment
            }
          }
        }
      }
    }
  }

  ${infoboxFragment}
`;

export const ADD_INFOBOX_FIELD = gql`
  mutation addInfoboxField(
    $layerId: ID!
    $pluginId: PluginID!
    $extensionId: PluginExtensionID!
    $index: Int
    $lang: String
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

export const MOVE_INFOBOX_FIELD = gql`
  mutation moveInfoboxField($layerId: ID!, $infoboxFieldId: ID!, $index: Int!, $lang: String) {
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
  mutation removeInfoboxField($layerId: ID!, $infoboxFieldId: ID!, $lang: String) {
    removeInfoboxField(input: { layerId: $layerId, infoboxFieldId: $infoboxFieldId }) {
      layer {
        id
        ...LayerFragment
      }
    }
  }

  ${layerFragment}
`;
