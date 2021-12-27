import React, { useMemo, useCallback } from "react";
import { useIntl } from "react-intl";

import AutoComplete from "@reearth/components/atoms/AutoComplete";
import Box from "@reearth/components/atoms/Box";
import Flex from "@reearth/components/atoms/Flex";
import { styled } from "@reearth/theme";

import { default as TagGroupComponent, TagGroup as TagGroupType } from "./TagGroup";
import { TagItem } from "./TagItem";

export const DEFAULT_TAG_GROUP_ID = "default";

export type Mode = "layer" | "scene";
export type TagGroup = TagGroupType;

export type Props<T extends Mode> = T extends "layer"
  ? CommonProps<T> & LayerTagProps
  : T extends "scene"
  ? CommonProps<T> & SceneTagProps
  : never;

type CommonProps<T extends Mode> = {
  mode: T;
  className?: string;
  attachedTagGroups?: TagGroup[];
};

type LayerTagProps = {
  attachableTagGroups?: TagGroup[];
  onTagGroupAttach?: (tagGroupId: string) => void;
  onTagGroupDetach?: (tagGroupId: string) => void;
  onTagItemAttach?: (tagGroupId: string, tagId: string) => void;
  onTagItemDetach?: (tagGroupId: string, tagItemId: string) => void;
  onTagGroupCreate?: (tagGroupLabel: string) => void;
  onTagItemCreate?: (tagGroupId: string, tagItemLabel: string) => void;
};

type SceneTagProps = {
  onTagGroupCreate?: (tagGroupLabel: string) => void;
  onTagItemCreate?: (tagGroupId: string, tagItemLabel: string) => void;
  onTagGroupDelete?: (tagGroupId: string) => void;
  onTagItemDelete?: (tagGroupId: string, tagItemId: string) => void;
  onTagGroupUpdate?: (tagGroupId: string, tagGroupLabel: string) => void;
};

const isLayerTagProps = (
  props: LayerTagProps | SceneTagProps,
  mode: Mode,
): props is LayerTagProps => {
  return mode === "layer";
};

const isSceneTagProps = (
  props: LayerTagProps | SceneTagProps,
  mode: Mode,
): props is SceneTagProps => {
  return mode === "scene";
};

function TagPane<T extends Mode>({
  className,
  attachedTagGroups,
  mode,
  ...rawProps
}: Props<T>): JSX.Element | null {
  const intl = useIntl();

  const getAttachableTags = (tagItems1?: TagItem[], tagItems2?: TagItem[]): TagItem[] => {
    if (!tagItems1 || !tagItems2) return [];
    return tagItems1.filter(ti => !tagItems2.map(ti2 => ti2.id).includes(ti.id));
  };

  const props = mode === "layer" ? (rawProps as LayerTagProps) : (rawProps as SceneTagProps);

  const autoCompleteItems = useMemo(() => {
    return isLayerTagProps(props, mode)
      ? props.attachableTagGroups
          ?.filter(tg => !attachedTagGroups?.map(atg => atg.id).includes(tg.id))
          .map(tg => ({ label: tg.label, value: tg.label }))
      : undefined;
  }, [attachedTagGroups, mode, props]);

  const handleTagGroupSelect = useCallback(
    (tagGroupLabel: string) => {
      if (isLayerTagProps(props, mode)) {
        const tagGroup = props.attachableTagGroups?.find(tg => tg.label === tagGroupLabel);
        if (!tagGroup) return;
        props.onTagGroupAttach?.(tagGroup.id);
      }
    },
    [mode, props],
  );

  return (
    <Wrapper className={className} direction="column">
      {attachedTagGroups?.map(tg => {
        return (
          <Box key={tg.id} mb="l">
            {mode === "layer" && isLayerTagProps(props, mode) ? (
              <TagGroupComponent
                tagGroup={tg}
                icon="cancel"
                onRemove={props.onTagGroupDetach}
                onTagItemAdd={props.onTagItemCreate}
                onTagItemRemove={props.onTagItemDetach}
                onTagItemSelect={props.onTagItemAttach}
                attachableTags={getAttachableTags(
                  props.attachableTagGroups?.find(atg => atg.id === tg.id)?.tagItems,
                  tg.tagItems,
                )}
              />
            ) : isSceneTagProps(props, mode) ? (
              <TagGroupComponent
                tagGroup={tg}
                icon={tg.id === DEFAULT_TAG_GROUP_ID ? undefined : "bin"}
                onLabelEdit={tg.id === DEFAULT_TAG_GROUP_ID ? undefined : props.onTagGroupUpdate}
                onRemove={props.onTagGroupDelete}
                onTagItemAdd={props.onTagItemCreate}
                onTagItemRemove={props.onTagItemDelete}
                removable={tg.id !== DEFAULT_TAG_GROUP_ID}
                tagDeletable
              />
            ) : null}
          </Box>
        );
      })}
      <AutoComplete
        onCreate={props.onTagGroupCreate}
        creatable
        onSelect={handleTagGroupSelect}
        items={autoCompleteItems}
        placeholder={intl.formatMessage({ defaultMessage: "Add a tag group" })}
      />
    </Wrapper>
  );
}

const Wrapper = styled(Flex)`
  padding: ${({ theme }) => `${theme.metrics.l}px`};
`;

export default TagPane;
