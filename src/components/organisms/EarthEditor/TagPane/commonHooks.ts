import { useCallback, useMemo } from "react";

import { useAuth } from "@reearth/auth";
import { TagGroup } from "@reearth/components/molecules/EarthEditor/TagPane";
import { DEFAULT_TAG_ID } from "@reearth/components/molecules/EarthEditor/TagPane/SceneTagPane";
import {
  useAttachTagItemToGroupMutation,
  useAttachTagToLayerMutation,
  useCreateTagGroupMutation,
  useCreateTagItemMutation,
  useDetachTagFromLayerMutation,
  useDetachTagItemFromGroupMutation,
  useGetLayerTagsQuery,
  useGetSceneTagsQuery,
  useRemoveTagMutation,
  useUpdateTagMutation,
} from "@reearth/gql";
import { useSceneId, useSelected } from "@reearth/state";

export default () => {
  const { isAuthenticated } = useAuth();
  const [sceneId] = useSceneId();
  const [selected] = useSelected();
  const { loading: sceneTagLoading, data: sceneData } = useGetSceneTagsQuery({
    variables: { sceneId: sceneId || "" },
    skip: !isAuthenticated || !sceneId,
  });
  const { loading: layerTagsLoading, data: layerTags } = useGetLayerTagsQuery({
    variables: { layerId: selected?.type === "layer" ? selected.layerId : "" },
    skip: selected?.type !== "layer" || !isAuthenticated,
  });

  const sceneTags = useMemo(() => {
    return sceneData?.node?.__typename === "Scene" ? sceneData.node.tags : undefined;
  }, [sceneData?.node]);

  const selectedLayerTags = useMemo(() => {
    return layerTags?.layer?.tags;
  }, [layerTags?.layer?.tags]);

  const sceneTagGroups = useMemo(() => {
    // TagItems which don't belong to any TagGroup will be in "Default" tag group
    const defaultTagGroup: TagGroup = { id: "default", label: DEFAULT_TAG_ID, tags: [] };
    const formattedGroups: TagGroup[] = sceneTags
      ? sceneTags
          ?.map(t => {
            if (t.__typename === "TagGroup") {
              return { id: t.id, label: t.label, tags: [] as any }; //TODO: fix here
            }
            defaultTagGroup.tags.push({ id: t.id, label: t.label });
            return;
          })
          .filter((t): t is TagGroup => {
            return !!t && "label" in t;
          })
      : [];
    return [defaultTagGroup, ...formattedGroups];
  }, [sceneTags]);

  const layerTagGroups = useMemo(() => {
    // TagItems which don't belong to any TagGroup will be in "Default" tag group
    const defaultTagGroup: TagGroup = { id: "default", label: DEFAULT_TAG_ID, tags: [] };
    const formattedGroups: TagGroup[] = selectedLayerTags
      ? selectedLayerTags
          ?.map(t => {
            if (t.__typename === "TagGroup") {
              return { id: t.id, label: t.label, tags: [] as any }; //TODO: fix here
            }
            defaultTagGroup.tags.push({ id: t.id, label: t.label });
            return;
          })
          .filter((t): t is TagGroup => {
            return !!t && "label" in t;
          })
      : [];
    return [defaultTagGroup, ...formattedGroups];
  }, [selectedLayerTags]);

  const [createTagGroup] = useCreateTagGroupMutation();
  const [createTagItem] = useCreateTagItemMutation();
  const [removeTag] = useRemoveTagMutation();
  const [updateTag] = useUpdateTagMutation();
  const [attachTagItemToGroup] = useAttachTagItemToGroupMutation();
  const [detachTagItemFromGroup] = useDetachTagItemFromGroupMutation();
  const [attachTagToLayer] = useAttachTagToLayerMutation();
  const [detachTagFromLayer] = useDetachTagFromLayerMutation();

  const handleCreateTagGroup = useCallback(
    async (label: string) => {
      if (!sceneId) return;
      if (sceneTagGroups.map(tg => tg.label).includes(label)) {
        alert("err!!!"); //TODO: change here
        return;
      }
      return await createTagGroup({
        variables: {
          sceneId,
          label,
        },
        refetchQueries: ["getSceneTags"],
      });
    },
    [createTagGroup, sceneId, sceneTagGroups],
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
  const handleCreateTagItem = useCallback(
    async (label: string, tagGroupId: string) => {
      if (!sceneId) return;
      // TODO: make valiation method
      if (
        sceneTagGroups
          .find(tg => tg.id === tagGroupId)
          ?.tags?.map(t => t.label)
          .includes(label)
      ) {
        alert("errrrrr");
        return;
      }
      console.log("label, tg--", label, tagGroupId);
      const tag = await createTagItem({
        variables: {
          sceneId,
          label,
        },
        refetchQueries: ["getSceneTags"],
      });
      if (tagGroupId === DEFAULT_TAG_ID) return tag;
      if (!tag.data?.createTagItem?.tag.id) return tag;
      await handleAttachTagItemToGroup(tag.data?.createTagItem?.tag.id, tagGroupId);
      return tag;
    },
    [createTagItem, handleAttachTagItemToGroup, sceneId, sceneTagGroups],
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

  const handleAttachTagGroupToLayer = useCallback(
    async (tagGroupId: string) => {
      if (selected?.type !== "layer") return;
      await attachTagToLayer({ variables: { tagId: tagGroupId, layerId: selected.layerId } });
    },
    [attachTagToLayer, selected],
  );

  const handleDetachTagGroupFromLayer = useCallback(
    async (tagGroupId: string) => {
      if (selected?.type !== "layer") return;
      await detachTagFromLayer({ variables: { tagId: tagGroupId, layerId: selected.layerId } });
    },
    [detachTagFromLayer, selected],
  );

  const handleAttachTagItemToLayer = useCallback(
    async (tagId: string) => {
      if (selected?.type !== "layer") return;
      await attachTagToLayer({
        variables: { tagId, layerId: selected.layerId },
        refetchQueries: ["getLayerTags"],
      });
    },
    [attachTagToLayer, selected],
  );

  const handleDetachTagItemFromLayer = useCallback(
    async (tagGroupId: string) => {
      if (selected?.type !== "layer") return;
      await detachTagFromLayer({
        variables: { tagId: tagGroupId, layerId: selected.layerId },
        refetchQueries: ["getLayerTags"],
      });
    },
    [detachTagFromLayer, selected],
  );

  const handleRemoveTagItemFromScene = useCallback(
    async (tagId: string) => {
      await removeTag({ variables: { tagId }, refetchQueries: ["getSceneTags"] });
    },
    [removeTag],
  );
  const handleRemoveTagGroupFromScene = useCallback(
    async (tagGroupId: string) => {
      if (tagGroupId === DEFAULT_TAG_ID) return;
      const tagGroup = sceneTagGroups.find(tg => tg.id === tagGroupId);
      if (!tagGroup || !tagGroup.tags || tagGroup.tags.length) {
        alert("error!!!!!");
        return;
      }
      await removeTag({ variables: { tagId: tagGroupId }, refetchQueries: ["getSceneTags"] });
    },
    [removeTag, sceneTagGroups],
  );

  const handleUpdateTagGroup = useCallback(
    async (tagGroupId: string, label: string) => {
      if (!sceneId) return;
      if (sceneTagGroups.map(tg => tg.label).includes(label)) {
        alert("err!!!"); //TODO: change here, validation
        return;
      }
      await updateTag({
        variables: { tagId: tagGroupId, sceneId: sceneId, label },
        refetchQueries: ["getSceneTags"],
      });
    },
    [sceneId, sceneTagGroups, updateTag],
  );

  const handleUpdateTagItem = useCallback(
    async (tagId: string, label: string) => {
      if (!sceneId) return;
      await updateTag({ variables: { tagId, sceneId: sceneId, label } });
    },
    [updateTag, sceneId],
  );

  return {
    createTagGroup: handleCreateTagGroup,
    createTagItem: handleCreateTagItem,
    attachTagGroupToLayer: handleAttachTagGroupToLayer,
    attachTagItemToLayer: handleAttachTagItemToLayer,
    detachTagGroupFromLayer: handleDetachTagGroupFromLayer,
    detachTagItemFromLayer: handleDetachTagItemFromLayer,
    removeTagGroupFromScene: handleRemoveTagGroupFromScene,
    removeTagItemFromScene: handleRemoveTagItemFromScene,
    updateTagGroup: handleUpdateTagGroup,
    sceneTagGroups,
    loading: sceneTagLoading || layerTagsLoading,
    layerTagGroups,
  };
};
