import { gql } from "@apollo/client";

export const INSTALLABLE_PLUGINS = gql`
  query InstallablePlugins {
    installablePlugins {
      name
      description
      thumbnailUrl
      author
      createdAt
    }
  }
`;

export const INSTALLED_PLUGINS = gql`
  query InstalledPlugins($projectId: ID!, $lang: Lang) {
    scene(projectId: $projectId) {
      id
      plugins {
        plugin {
          id
          version
          name
          description
          translatedName(lang: $lang)
          translatedDescription(lang: $lang)
          author
          repositoryUrl
        }
      }
    }
  }
`;

export const UPLOAD_PLUGIN = gql`
  mutation UploadPlugin($sceneId: ID!, $file: Upload, $url: URL) {
    uploadPlugin(input: { sceneId: $sceneId, file: $file, url: $url }) {
      plugin {
        id
        name
        version
        description
        author
      }
      scenePlugin {
        pluginId
        propertyId
      }
    }
  }
`;

export const UNINSTALL_PLUGIN = gql`
  mutation uninstallPlugin($sceneId: ID!, $pluginId: ID!) {
    uninstallPlugin(input: { sceneId: $sceneId, pluginId: $pluginId }) {
      pluginId
    }
  }
`;
