import { gql } from "@apollo/client";

export const SCENE = gql`
  query Scene($projectId: ID!) {
    scene(projectId: $projectId) {
      id
      projectId
      teamId
    }
  }
`;

export const GET_SCENE = gql`
  query getScene($sceneId: ID!) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        rootLayerId
      }
    }
  }
`;

export const CREATE_SCENE = gql`
  mutation CreateScene($projectId: ID!) {
    createScene(input: { projectId: $projectId }) {
      scene {
        id
      }
    }
  }
`;
