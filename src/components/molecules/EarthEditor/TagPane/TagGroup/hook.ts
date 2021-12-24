import { useCallback, useMemo, useRef, useState } from "react";
import { useClickAway } from "react-use";

import type { TagItem as TagItemType } from "../TagItem";

export type TagItem = TagItemType;

export type TagGroup = {
  id: string;
  label: string;
  tagItems: TagItem[];
};

export default ({
  tagGroup,
  onLabelEdit,
  onRemove,
  onTagItemAdd,
  onTagItemRemove,
  onTagItemSelect,
  attachableTags,
}: {
  tagGroup: TagGroup;
  onLabelEdit?: (tagGroupId: string, label: string) => void;
  onRemove?: (id: string) => void;
  onTagItemAdd?: (tagGroupId: string, tagItemLabel: string) => void;
  onTagItemRemove?: (tagGroupId: string, tagItemId: string) => void;
  onTagItemSelect?: (tagGroupId: string, tagItemId: string) => void;
  attachableTags?: TagItem[];
}) => {
  const [isLabelEditing, setIsLabelEditing] = useState(false);
  const labelRef = useRef(null);
  useClickAway(labelRef, () => setIsLabelEditing(false));

  const handleStartEditing = useCallback(() => {
    setIsLabelEditing(true);
  }, [setIsLabelEditing]);

  const handleLabelEdit = useCallback(
    (label: string) => {
      onLabelEdit?.(tagGroup.id, label);
      setIsLabelEditing(false);
    },
    [onLabelEdit, tagGroup.id],
  );

  const handleRemove = useCallback(() => {
    onRemove?.(tagGroup.id);
  }, [onRemove, tagGroup.id]);

  const handleTagItemSelect = useCallback(
    (tagItemLabel: string) => {
      const targetTag = attachableTags?.find(t => t.label === tagItemLabel); //TODO: fix here, 本来であればIDで絞り込みをするべき
      if (!targetTag) return;
      onTagItemSelect?.(targetTag?.id, tagItemLabel);
    },
    [attachableTags, onTagItemSelect],
  );

  const handleTagItemAdd = useCallback(
    (label: string) => {
      onTagItemAdd?.(tagGroup.id, label);
    },
    [onTagItemAdd, tagGroup.id],
  );

  const handleTagItemRemove = useCallback(
    (tagItemId: string) => {
      onTagItemRemove?.(tagGroup.id, tagItemId);
    },
    [onTagItemRemove, tagGroup.id],
  );

  // TODO: move this logic to tag pane
  // const autoCompleteItems = useMemo(() => {
  //   return attachableTags
  //     ?.filter(t => !attachedTags?.map(t2 => t2.id).includes(t.id))
  //     .map(t => ({ value: t.label, label: t.label }));
  // }, [attachableTags, attachedTags]);

  // TODO: create auto complete compoenet only for tag
  const autoCompleteItems = useMemo(() => {
    return attachableTags?.map(t => ({ value: t.label, label: t.label }));
  }, [attachableTags]);

  // TagGroup can be removed only when it doesn't have any TagItem
  const isGroupRemovable = tagGroup.tagItems?.length === 0;

  return {
    labelRef,
    isLabelEditing,
    handleStartEditing,
    handleLabelEdit,
    handleRemove,
    handleTagItemAdd,
    handleTagItemRemove,
    handleTagItemSelect,
    isGroupRemovable,
    autoCompleteItems,
  };
};
