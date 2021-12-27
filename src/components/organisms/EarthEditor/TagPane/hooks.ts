import { useCallback, useMemo } from "react";

import { useAuth } from "@reearth/auth";
import {
  Mode as ModeType,
  DEFAULT_TAG_GROUP_ID,
  TagGroup,
} from "@reearth/components/molecules/EarthEditor/TagPane";
import {
  useAttachTagToLayerMutation,
  useCreateTagGroupMutation,
  useCreateTagItemMutation,
  useDetachTagFromLayerMutation,
  useGetLayerTagsQuery,
  useGetSceneTagsQuery,
  useRemoveTagMutation,
  useUpdateTagMutation,
} from "@reearth/gql";
import { useNotification, useSceneId, useSelected } from "@reearth/state";

import useValidate from "./use-validate";

export type Mode = ModeType;
export { DEFAULT_TAG_GROUP_ID } from "@reearth/components/molecules/EarthEditor/TagPane";

export default ({ mode }: { mode: Mode }) => {
  const { isAuthenticated } = useAuth();
  const [sceneId] = useSceneId();
  const [selected] = useSelected();
  const [, setNotification] = useNotification();
  const tagValidator = useValidate();

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
  }, [layerTags?.layer]);

  const sceneTagGroups = useMemo(() => {
    // TagItems which don't belong to any TagGroup will be in "Default" tag group
    const defaultTagGroup: TagGroup = { id: DEFAULT_TAG_GROUP_ID, label: "Default", tagItems: [] };
    const formattedGroups: TagGroup[] = sceneTags
      ? sceneTags
          ?.map(t => {
            if (t.__typename === "TagGroup") {
              return { id: t.id, label: t.label, tagItems: t.tags };
            }
            defaultTagGroup.tagItems.push({ id: t.id, label: t.label });
            return;
          })
          .filter((t): t is TagGroup => {
            return !!t && "label" in t && "tagItems" in t;
          })
      : [];
    return [defaultTagGroup, ...formattedGroups];
  }, [sceneTags]);

  const layerTagGroups = useMemo(() => {
    // TagItems which don't belong to any TagGroup will be in "Default" tag group
    const defaultTagGroup: TagGroup = { id: DEFAULT_TAG_GROUP_ID, label: "Default", tagItems: [] };
    const formattedGroups: TagGroup[] = selectedLayerTags
      ? selectedLayerTags
          ?.map(t => {
            if (!t.tag) return;
            if (t.__typename === "LayerTagGroup") {
              return {
                id: t.tag?.id,
                label: t.tag?.label,
                tagItems: t.children.map(c => ({ id: c.tag?.id, label: c.tag?.label })),
              };
            }
            defaultTagGroup.tagItems.push({ id: t.tag.id, label: t.tag.label });
            return;
          })
          .filter((t): t is TagGroup => {
            return !!t && "label" in t && "tagItems" in t;
          })
      : [];
    return [defaultTagGroup, ...formattedGroups];
  }, [selectedLayerTags]);

  // Mutation //
  const [createTagGroup] = useCreateTagGroupMutation();
  const [createTagItem] = useCreateTagItemMutation();
  const [removeTag] = useRemoveTagMutation();
  const [updateTag] = useUpdateTagMutation();
  const [attachTagToLayer] = useAttachTagToLayerMutation();
  const [detachTagFromLayer] = useDetachTagFromLayerMutation();

  const handleCreateTagGroup = useCallback(
    async (label: string) => {
      if (!sceneId) return;
      const validationErr = tagValidator.dupulicatedTagGgroupLabel(sceneTagGroups, label);
      if (validationErr !== null) {
        setNotification({ type: "error", text: validationErr });
        return;
      }
      const tagGroup = await createTagGroup({
        variables: {
          sceneId,
          label,
        },
        refetchQueries: ["getSceneTags"],
      });
      if (mode !== "layer" || selected?.type !== "layer" || !tagGroup.data?.createTagGroup?.tag.id)
        return;
      await attachTagToLayer({
        variables: {
          tagId: tagGroup.data.createTagGroup.tag.id,
          layerId: selected.layerId,
        },
      });
    },
    [
      createTagGroup,
      sceneId,
      sceneTagGroups,
      setNotification,
      mode,
      attachTagToLayer,
      selected,
      tagValidator,
    ],
  );

  const handleCreateTagItem = useCallback(
    async (tagGroupId: string, label: string) => {
      if (!sceneId) return;
      const tagGroup = sceneTagGroups.find(tg => tg.id === tagGroupId);
      if (!tagGroup) return;
      const validationErr = tagValidator.dupulicatedTagItemLabel(tagGroup, label);
      if (validationErr !== null) {
        setNotification({ type: "error", text: validationErr });
        return;
      }
      const tagItem = await createTagItem({
        variables: {
          sceneId,
          label,
          parent: tagGroupId === DEFAULT_TAG_GROUP_ID ? undefined : tagGroupId,
        },
        refetchQueries: tagGroupId === DEFAULT_TAG_GROUP_ID ? ["getSceneTags"] : [],
      });
      if (mode !== "layer" || selected?.type !== "layer" || !tagItem.data?.createTagItem?.tag.id)
        return;
      await attachTagToLayer({
        variables: {
          tagId: tagItem.data.createTagItem.tag.id,
          layerId: selected.layerId,
        },
      });
    },
    [
      createTagItem,
      sceneId,
      sceneTagGroups,
      setNotification,
      tagValidator,
      attachTagToLayer,
      mode,
      selected,
    ],
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
    async (tagItemId: string) => {
      if (selected?.type !== "layer") return;
      await attachTagToLayer({
        variables: { tagId: tagItemId, layerId: selected.layerId },
      });
    },
    [attachTagToLayer, selected],
  );

  const handleDetachTagItemFromLayer = useCallback(
    async (_tagGroupId: string, tagItemId: string) => {
      if (selected?.type !== "layer") return;
      await detachTagFromLayer({
        variables: { tagId: tagItemId, layerId: selected.layerId },
      });
    },
    [detachTagFromLayer, selected],
  );

  const handleRemoveTagItemFromScene = useCallback(
    async (_tagGroupId: string, tagItemId: string) => {
      await removeTag({ variables: { tagId: tagItemId }, refetchQueries: ["getSceneTags"] });
    },
    [removeTag],
  );

  const handleRemoveTagGroupFromScene = useCallback(
    async (tagGroupId: string) => {
      if (tagGroupId === DEFAULT_TAG_GROUP_ID) return;
      const tagGroup = sceneTagGroups.find(tg => tg.id === tagGroupId);
      const validationErr = tagValidator.nonEmptyTagGroup(tagGroup);
      if (validationErr) {
        setNotification({ type: "error", text: validationErr });
        return;
      }
      await removeTag({ variables: { tagId: tagGroupId }, refetchQueries: ["getSceneTags"] });
    },
    [tagValidator, removeTag, sceneTagGroups, setNotification],
  );

  const handleUpdateTagGroup = useCallback(
    async (tagGroupId: string, label: string) => {
      if (!sceneId) return;
      const validationErr = tagValidator.dupulicatedTagGgroupLabel(sceneTagGroups, label);
      if (validationErr) {
        setNotification({ type: "error", text: validationErr });
        return;
      }
      await updateTag({
        variables: { tagId: tagGroupId, sceneId: sceneId, label },
      });
    },
    [sceneId, sceneTagGroups, setNotification, updateTag, tagValidator],
  );

  return mode === "layer"
    ? {
        loading: sceneTagLoading || layerTagsLoading,
        attachedTagGroups: layerTagGroups,
        attachableTagGroups: sceneTagGroups,
        onTagGroupAttach: handleAttachTagGroupToLayer,
        onTagGroupDetach: handleDetachTagGroupFromLayer,
        onTagItemAttach: handleAttachTagItemToLayer,
        onTagItemDetach: handleDetachTagItemFromLayer,
        onTagGroupCreate: handleCreateTagGroup,
        onTagItemCreate: handleCreateTagItem,
      }
    : {
        loading: sceneTagLoading || layerTagsLoading,
        attachedTagGroups: sceneTagGroups,
        onTagGroupCreate: handleCreateTagGroup,
        onTagItemCreate: handleCreateTagItem,
        onTagGroupDelete: handleRemoveTagGroupFromScene,
        onTagItemDelete: handleRemoveTagItemFromScene,
        onTagGroupUpdate: handleUpdateTagGroup,
      };
};
