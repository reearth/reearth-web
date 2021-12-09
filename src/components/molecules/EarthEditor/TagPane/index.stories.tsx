import { Meta, Story } from "@storybook/react";
import { isArray } from "lodash";
import React, { useState } from "react";

import TagPane, { Props, TagGroup } from ".";

export default {
  title: "molecules/EarthEditor/TagPane",
  component: TagPane,
} as Meta;

export const Default: Story<Props> = () => {
  const [allTagGroups, setAllTagGroups] = useState<TagGroup[]>([
    { name: "Default", tags: ["hoge", "fuga", "foo", "wow"] },
    { name: "Year", tags: ["1995", "2000", "2005"] },
  ]);
  const [tagGroups, setTagGroups] = useState<TagGroup[]>([
    { name: "Default", tags: ["hoge", "fuga"] },
    { name: "Year", tags: ["1995", "2000"] },
  ]);
  const isTagGroup = (tagGroup: any): tagGroup is TagGroup => {
    return "name" in tagGroup && "tags" in tagGroup && isArray(tagGroup["tags"]) && !!tagGroup;
  };
  const handleAddTagGroup = (value: string) => {
    setAllTagGroups(old =>
      old.find(g => g.name === value) ? old : [...old, { name: value, tags: [] }],
    );
    setTagGroups(old => [...old, { name: value, tags: [] }]);
  };
  const handleAddTag = (tagGroup: string, tag: string) => {
    setAllTagGroups(old => {
      const targetTagGroup = old.find(tg => tg.name === tagGroup);
      const result = targetTagGroup?.tags.includes(tag)
        ? old
        : isTagGroup(targetTagGroup)
        ? [
            ...old.filter(g => g !== targetTagGroup),
            { name: targetTagGroup?.name, tags: [...targetTagGroup?.tags, tag] },
          ]
        : [];
      return result;
    });

    setTagGroups(old => {
      return old.map(tg => {
        if (tg.name === tagGroup) {
          tg.tags.push(tag);
        }
        return tg;
      });
    });
  };
  return (
    <TagPane
      allTagGroups={allTagGroups}
      tagGroups={tagGroups}
      onTagGroupAdd={handleAddTagGroup}
      onTagAdd={handleAddTag}
    />
  );
};
