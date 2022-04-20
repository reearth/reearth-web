import { gql } from "@apollo/client";

import { widgetAlignSysFragment } from "@reearth/gql/fragments";

export const GET_WIDGETS = gql`
  query GetWidgets($sceneId: ID!, $lang: String) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        plugins {
          plugin {
            id
            extensions {
              extensionId
              description
              name
              translatedDescription(lang: $lang)
              translatedName(lang: $lang)
              icon
              singleOnly
              type
              widgetLayout {
                extendable {
                  vertically
                  horizontally
                }
                extended
                floating
                defaultLocation {
                  zone
                  section
                  area
                }
              }
            }
          }
        }
        widgets {
          id
          enabled
          extended
          pluginId
          extensionId
          propertyId
        }
      }
    }
  }
`;

export const GET_EARTH_WIDGETS = gql`
  query GetEarthWidgets($sceneId: ID!, $lang: String) {
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
        clusters {
          id
          name
          propertyId
          property {
            id
            ...PropertyFragment
          }
        }
        tags {
          id
          label
          ... on TagGroup {
            tags {
              id
              label
            }
          }
        }
        plugins {
          property {
            id
            ...PropertyFragment
          }
          pluginId
          plugin {
            id
            extensions {
              extensionId
              type
              widgetLayout {
                floating
                extendable {
                  vertically
                  horizontally
                }
                extended
                defaultLocation {
                  zone
                  section
                  area
                }
              }
            }
          }
        }
        widgets {
          id
          enabled
          extended
          pluginId
          extensionId
          property {
            id
            ...PropertyFragment
          }
        }
        widgetAlignSystem {
          ...WidgetAlignSystemFragment
        }
      }
    }
  }

  ${widgetAlignSysFragment}
`;

export const ADD_WIDGET = gql`
  mutation addWidget(
    $sceneId: ID!
    $pluginId: PluginID!
    $extensionId: PluginExtensionID!
    $lang: String
  ) {
    addWidget(input: { sceneId: $sceneId, pluginId: $pluginId, extensionId: $extensionId }) {
      scene {
        id
        widgets {
          id
          enabled
          pluginId
          extensionId
          propertyId
          property {
            id
            ...PropertyFragment
          }
        }
      }
      sceneWidget {
        id
        enabled
        pluginId
        extensionId
      }
    }
  }
`;

export const REMOVE_WIDGET = gql`
  mutation removeWidget($sceneId: ID!, $widgetId: ID!) {
    removeWidget(input: { sceneId: $sceneId, widgetId: $widgetId }) {
      scene {
        id
        widgets {
          id
          enabled
          pluginId
          extensionId
          propertyId
        }
      }
    }
  }
`;

export const UPDATE_WIDGET = gql`
  mutation updateWidget(
    $sceneId: ID!
    $widgetId: ID!
    $enabled: Boolean
    $location: WidgetLocationInput
    $extended: Boolean
    $index: Int
  ) {
    updateWidget(
      input: {
        sceneId: $sceneId
        widgetId: $widgetId
        enabled: $enabled
        location: $location
        extended: $extended
        index: $index
      }
    ) {
      scene {
        id
        widgets {
          id
          enabled
          extended
          pluginId
          extensionId
          propertyId
        }
      }
    }
  }

  ${widgetAlignSysFragment}
`;

export const UPDATE_WIDGET_ALIGN_SYSTEM = gql`
  mutation updateWidgetAlignSystem(
    $sceneId: ID!
    $location: WidgetLocationInput!
    $align: WidgetAreaAlign
  ) {
    updateWidgetAlignSystem(input: { sceneId: $sceneId, location: $location, align: $align }) {
      scene {
        id
        widgets {
          id
          enabled
          pluginId
          extensionId
          propertyId
        }
        widgetAlignSystem {
          ...WidgetAlignSystemFragment
        }
      }
    }
  }

  ${widgetAlignSysFragment}
`;
