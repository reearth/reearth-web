import { gql } from "@apollo/client";

export const GET_SCENE_TAGS = gql`
  query getSceneTags($sceneId: ID!) {
    node(id: $sceneId, type: SCENE) {
      id
      ... on Scene {
        tagIds
        tags {
          id
          label
          sceneId
        }
      }
    }
  }
`;

export const CREATE_TAG_GROUP = gql`
  mutation createTagGroup($sceneId: ID!, $label: String!) {
    createTagGroup(input: { sceneId: $sceneId, label: $label }) {
      tag {
        id
        label
      }
    }
  }
`;

export const CREATE_TAG_ITEM = gql`
  mutation createTagItem(
    $sceneId: ID!
    $label: String!
    $linkedDatasetSchemaId: ID
    $linkedDatasetID: ID
    $linkedDatasetField: ID
  ) {
    createTagItem(
      input: {
        sceneId: $sceneId
        label: $label
        linkedDatasetSchemaID: $linkedDatasetSchemaId
        linkedDatasetID: $linkedDatasetID
        linkedDatasetField: $linkedDatasetField
      }
    ) {
      tag {
        id
        label
      }
    }
  }
`;

export const ATTACH_TAG_ITEM_TO_GROUP = gql`
  mutation attachTagItemToGroup($itemId: ID!, $groupId: ID!) {
    attachTagItemToGroup(input: { itemID: $itemId, groupID: $groupId }) {
      tag {
        id
        label
        tags
      }
    }
  }
`;

export const DETACH_TAG_ITEM_FROM_GROUP = gql`
  mutation detachTagItemFromGroup($itemId: ID!, $groupId: ID!) {
    detachTagItemFromGroup(input: { itemID: $itemId, groupID: $groupId }) {
      tag {
        id
        label
        tags
      }
    }
  }
`;

export const ATTACH_TAG_TO_LAYER = gql`
  mutation attachTagToLayer($tagId: ID!, $layerId: ID!) {
    attachTagToLayer(input: { tagID: $tagId, layerID: $layerId }) {
      layer {
        id
        propertyId
        tags {
          id
          label
        }
        tagIds
      }
    }
  }
`;
export const DETACH_TAG_FROM_LAYER = gql`
  mutation detachTagFromLayer($tagId: ID!, $layerId: ID!) {
    detachTagFromLayer(input: { tagID: $tagId, layerID: $layerId }) {
      layer {
        id
        propertyId
        tags {
          id
          label
        }
        tagIds
      }
    }
  }
`;
