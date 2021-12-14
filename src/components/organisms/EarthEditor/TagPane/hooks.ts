import { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { useAuth } from "@reearth/auth";
import { TagGroup } from "@reearth/components/molecules/EarthEditor/TagPane";
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

export type Mode = "scene" | "layer";

export default () => {
  const DEFAULT_TAG_ID = "default";
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<Mode>("scene");
  const [sceneId] = useSceneId();
  const [selected] = useSelected();
  const { loading: sceneTagLoading, data: sceneData } = useGetSceneTagsQuery({
    variables: { sceneId: sceneId || "" },
    skip: !isAuthenticated || !sceneId,
  });
  // const {loading: sceneLoading, data: sceneData2} = useGetSceneQuery({
  //   variables: {sceneId: sceneId || ""},
  //   skip: !isAuthenticated || !sceneId
  // });
  const intl = useIntl();
  const { loading: layerTagsLoading, data: layerTags } = useGetLayerTagsQuery({
    variables: { layerId: selected?.type === "layer" ? selected.layerId : "", lang: intl.locale },
    skip: selected?.type !== "layer" || !isAuthenticated,
  });

  useEffect(() => {
    setMode(selected?.type === "layer" ? "layer" : "scene");
  }, [selected?.type, setMode]);

  const sceneTags = useMemo(() => {
    return sceneData?.node?.__typename === "Scene" ? sceneData.node.tags : undefined;
  }, [sceneData?.node]);

  useEffect(() => {
    console.log(
      "tags----",
      sceneTags?.filter(t => t.__typename === "TagGroup").map(t => t.label),
    );
  }, [sceneTags]);
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
              return { id: t.id, label: t.label };
            }
            defaultTagGroup.tags.push({ id: t.id, label: t.label });
            return;
          })
          .filter((t): t is TagGroup => {
            return !!t && "label" in t;
          })
      : [];
    console.log("t-------", [defaultTagGroup, ...formattedGroups]);
    return [defaultTagGroup, ...formattedGroups];
  }, [sceneTags]);

  useEffect(() => {
    console.log("group---------", sceneTagGroups);
  }, [sceneTagGroups]);

  //TODO: clean up here
  const layerTagGroups = useMemo(() => {
    const defaultTagGroup: TagGroup = { id: DEFAULT_TAG_ID, label: "Default", tags: [] };
    const formattedGroups: TagGroup[] = selectedLayerTags
      ? selectedLayerTags
          ?.map(t => {
            if (t.__typename === "TagGroup") {
              return { label: t.label };
            }
            defaultTagGroup.tags.push({ id: t.id, label: t.label });
            return;
          })
          .filter((t): t is TagGroup => {
            return !!t && "label" in t && "tags" in t;
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
      const tagGroup = await createTagGroup({
        variables: {
          sceneId,
          label,
        },
        refetchQueries: ["getSceneTags"],
      });
      if (mode === "scene") return;
      if (selected?.type !== "layer") return; //TODO: fix these dependencies
      if (!tagGroup.data?.createTagGroup?.tag.id) return;
      await attachTagToLayer({
        variables: { layerId: selected?.layerId, tagId: tagGroup.data?.createTagGroup?.tag.id },
      });
    },
    [attachTagToLayer, createTagGroup, mode, sceneId, selected?.layerId, selected?.type],
  );

  const handleCreateTagItem = useCallback(
    async (tagGroupId: string, label: string) => {
      if (!sceneId) return;
      // TODO: make valiation method
      if (
        sceneTagGroups
          .find(tg => tg.id === tagGroupId)
          ?.tags.map(t => t.label)
          .includes(label)
      ) {
        alert("errrrrr");
        return;
      }
      const tag = await createTagItem({
        variables: {
          sceneId,
          label,
        },
        refetchQueries: ["getSceneTags"],
      });
      if (tagGroupId === DEFAULT_TAG_ID) return;
      if (!tag.data?.createTagItem?.tag.id) return;
      await handleAttachTagItemToGroup(tag.data?.createTagItem?.tag.id, tagGroupId);
      if (mode === "scene") return;
      await handleAttachTagItemToLayer(tag.data.createTagItem.tag.id);
    },
    [
      createTagItem,
      handleAttachTagItemToGroup,
      handleAttachTagItemToLayer,
      mode,
      sceneId,
      sceneTagGroups,
    ],
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

  const handleAttachTagGroupToLayer = useCallback(
    async (tagGroupId: string) => {
      if (selected?.type !== "layer") return;
      await attachTagToLayer({ variables: { tagId: tagGroupId, layerId: selected.layerId } });
    },
    [attachTagToLayer, (selected as any).layerId, selected?.type],
  );

  const handleDetachTagGroupFromLayer = useCallback(
    async (tagGroupId: string) => {
      if (selected?.type !== "layer") return;
      await detachTagFromLayer({ variables: { tagId: tagGroupId, layerId: selected.layerId } });
    },
    [detachTagFromLayer, (selected as any).layerId, selected?.type],
  );
  const handleAttachTagItemToLayer = useCallback(
    async (tagId: string) => {
      if (selected?.type !== "layer") return;
      await attachTagToLayer({ variables: { tagId, layerId: selected.layerId } });
    },
    [attachTagToLayer, (selected as any)?.layerId, selected?.type],
  );

  const handleDetachTagItemFromLayer = useCallback(
    async (tagId: string) => {
      if (selected?.type !== "layer") return;
      await detachTagFromLayer({ variables: { tagId, layerId: selected.layerId } });
    },
    [detachTagFromLayer, (selected as any)?.layerId, selected?.type],
  );

  const handleRemoveTagFromScene = useCallback(
    async (tagId: string) => {
      await removeTag({ variables: { tagId } });
    },
    [removeTag],
  );

  const handleUpdateTag = useCallback(
    async (tagId: string, label: string) => {
      if (!sceneId) return;
      await updateTag({ variables: { tagId, sceneId: sceneId, label } });
    },
    [updateTag, sceneId],
  );

  return {
    loading: sceneTagLoading || layerTagsLoading,
    handleAddTag: mode === "scene" ? handleCreateTagItem : handleAttachTagItemToLayer,
    handleRemoveTag: mode === "scene" ? handleRemoveTagFromScene : handleDetachTagItemFromLayer,
    handleAddTagGroup: mode === "scene" ? handleCreateTagGroup : handleAttachTagGroupToLayer,
    handleRemoveTagGroup:
      mode === "scene" ? handleRemoveTagFromScene : handleDetachTagGroupFromLayer,
    sceneTags: sceneTagGroups,
    attachedTags: mode === "scene" ? sceneTagGroups : layerTagGroups,
  };
};
