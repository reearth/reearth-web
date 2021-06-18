import { gql } from "@apollo/client";

export const INSTALLABLE_PLUGINS = gql`
  query InstallablePlugins {
    installablePlugins {
      name
      description
      createdAt
    }
  }
`;
