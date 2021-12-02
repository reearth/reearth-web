import { Meta, Story } from "@storybook/react";
import { isArray } from "lodash";
import React, { useState } from "react";

import TagPane, { Props, TagGroup } from ".";

export default {
  title: "molecules/EarthEditor/TagPane",
  component: TagPane,
} as Meta;

export const Default: Story<Props> = () => {
  const [allTags, setAllTags] = useState(["hoge", "fuga", "foo", "wow", "1995", "2000", "2005"]);
  const [tagGroups, setTagGroups] = useState<TagGroup[]>([
    { name: "Default", tags: ["hoge", "fuga"] },
    { name: "Year", tags: ["1995", "2000", "2005"] },
  ]);
  const isTagGroup = (tagGroup: any): tagGroup is TagGroup => {
    return "name" in tagGroup && "tag" in tagGroup && isArray(tagGroup["tag"]) && !!tagGroup;
  };
  const handleAddTagGroup = (value: string) => {
    setTagGroups(old => [...old, { name: value, tags: [] }]);
  };
  const handleAddTag = (tagGroup: string, tag: string) => {
    setAllTags(old => [...old, tag]);
    setTagGroups(old => {
      const targetTagGroup = old.find(tg => tg.name === tagGroup);

      return isTagGroup(tagGroup)
        ? [old.filter(tg => tg.name !== tagGroup), targetTagGroup?.tags.push(tag)]
        : [];
    });
  };
  return <TagPane allTags={allTags} tagGroups={tagGroups} />;
};
