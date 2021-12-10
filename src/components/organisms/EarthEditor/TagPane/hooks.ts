import { useCallback, useMemo } from "react";

import { useAuth } from "@reearth/auth";
import { TagGroup } from "@reearth/components/molecules/EarthEditor/TagPane";
import {
  useAttachTagItemToGroupMutation,
  useCreateTagGroupMutation,
  useCreateTagItemMutation,
  useDetachTagItemFromGroupMutation,
  useGetSceneTagsQuery,
} from "@reearth/gql";
import { useSceneId } from "@reearth/state";

export type Mode = "scene" | "layer";

export default () => {
  const { isAuthenticated } = useAuth();
  const [sceneId] = useSceneId();
  const { loading, data: sceneData } = useGetSceneTagsQuery({
    variables: { sceneId: sceneId || "" },
    skip: !isAuthenticated || !sceneId,
  });

  const sceneTags = useMemo(() => {
    return sceneData?.node?.__typename === "Scene" ? sceneData.node.tags : undefined;
  }, [sceneData?.node]);

  const sceneTagGroups = useMemo(() => {
    //TODO: change this type to TagGroup
    const defaultTagGroup: TagGroup = { name: "Default", tags: [] };
    const formattedGroups: TagGroup[] = sceneTags
      ? sceneTags
          ?.map(t => {
            if (t.__typename === "TagGroup") {
              return { name: t.label, tags: ["hoge"] };
            }
            defaultTagGroup.tags.push(t.label);
            return;
          })
          .filter((t): t is TagGroup => {
            return !!t && "name" in t && "tags" in t;
          })
      : [];
    return [defaultTagGroup, ...formattedGroups];
  }, [sceneTags]);

  const [createTagGroup] = useCreateTagGroupMutation();
  const [createTagItem] = useCreateTagItemMutation();
  const [attachTagItemToGroup] = useAttachTagItemToGroupMutation();
  const [detachTagItemFromGroup] = useDetachTagItemFromGroupMutation();

  const handleCreateTagGroup = useCallback(
    async (label: string) => {
      if (!sceneId) return;
      await createTagGroup({
        variables: {
          sceneId,
          label,
        },
        refetchQueries: ["getSceneTags"],
      });
    },
    [createTagGroup, sceneId],
  );

  const handleCreateTagItem = useCallback(
    async (tagGroup: string, label: string) => {
      if (!sceneId) return;
      await createTagItem({
        variables: {
          sceneId,
          label,
        },
        refetchQueries: ["getSceneTags"],
      });
    },
    [createTagItem, sceneId],
  );

  const handleAttachTagItemToGroup = useCallback(
    async (itemId: string, groupId: string) => {
      await attachTagItemToGroup({
        variables: {
          itemId,
          groupId,
        },
      });
    },
    [attachTagItemToGroup],
  );

  const handleDetachTagItemFromGroup = useCallback(
    async (itemId: string, groupId: string) => {
      await detachTagItemFromGroup({
        variables: {
          itemId,
          groupId,
        },
      });
    },
    [detachTagItemFromGroup],
  );

  return {
    loading,
    handleCreateTagGroup,
    handleCreateTagItem,
    sceneTagGroups,
    handleAttachTagItemToGroup,
    handleDetachTagItemFromGroup,
  };
};
