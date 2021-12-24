import { Meta, Story } from "@storybook/react";
import React, { useState } from "react";

import TagGroup, { Props } from ".";
import type { TagGroup as TagGroupType } from ".";

export default {
  title: "molecules/EarthEditor/TagPane/TagGroup",
  component: TagGroup,
} as Meta;

export const Default: Story<Props> = () => {
  const [tagGroup, setTagGroup] = useState<TagGroupType>({
    id: "year",
    label: "Year",
    tagItems: [
      { id: "1995", label: "1995" },
      { id: "2000", label: "2000" },
    ],
  });

  const [attachableTags, setAttachableTags] = useState([
    { id: "1995", label: "1995" },
    { id: "2000", label: "2000" },
    { id: "2005", label: "2005" },
  ]);

  const handleLabelEdit = (_tagGroupId: string, label: string) => {
    setTagGroup(old => ({ ...old, label }));
  };

  const handleRemove = (tagGroupId: string) => console.log("remove tagGroupId:", tagGroupId);

  const handleTagItemAdd = (_tagGroupId: string, tagItemLabel: string) => {
    setAttachableTags(old => [...old, { id: tagItemLabel, label: tagItemLabel }]);
    setTagGroup(old => ({
      ...old,
      tagItems: [...old.tagItems, { id: "label", label: tagItemLabel }],
    }));
  };

  const handleTagItemRemove = (_tagGroupId: string, tagItemId: string) => {
    setTagGroup(old => ({ ...old, tagItems: old.tagItems.filter(t => t.id !== tagItemId) }));
  };

  const handleTagItemSelect = (_tagGroupId: string, tagItemId: string) => {
    const targetTagItem = attachableTags.find(t => t.id === tagItemId);
    if (!targetTagItem) return;
    setTagGroup(old => ({
      ...old,
      tagItems: [...old.tagItems, targetTagItem],
    }));
  };

  return (
    <TagGroup
      tagGroup={tagGroup}
      icon="cancel"
      onLabelEdit={handleLabelEdit}
      onRemove={handleRemove}
      onTagItemAdd={handleTagItemAdd}
      onTagItemRemove={handleTagItemRemove}
      onTagItemSelect={handleTagItemSelect}
      attachableTags={attachableTags.filter(
        t => !tagGroup.tagItems.map(ti => ti.id).includes(t.id),
      )}
    />
  );
};
