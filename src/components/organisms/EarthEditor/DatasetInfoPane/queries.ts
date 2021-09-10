import { gql } from "@apollo/client";

export const GET_ALL_DATASETS = gql`
  query GetAllDataSets($sceneId: ID!) {
    datasetSchemas(sceneId: $sceneId, first: 100) {
      nodes {
        id
        source
        name
        sceneId
        fields {
          id
          name
          type
        }
        datasets {
          totalCount
        }
      }
    }
  }
`;
