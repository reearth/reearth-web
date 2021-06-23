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
  query InstalledPlugins($projectId: ID!) {
    scene(projectId: $projectId) {
      id
      plugins {
        plugin {
          id
          name
          version
          description
          author
          repositoryUrl
        }
      }
    }
  }
`;
