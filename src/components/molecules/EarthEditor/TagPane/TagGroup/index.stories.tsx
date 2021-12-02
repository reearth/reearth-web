import { Meta, Story } from "@storybook/react";
import React, { useState } from "react";

import TagGroup, { Props } from ".";

export default {
  title: "molecules/EarthEditor/TagGroup/TagGroup",
  component: TagGroup,
} as Meta;

export const Default: Story<Props> = () => {
  const [attachedTags, attachTag] = useState(["hoge", "fuga"]);
  const [allTags, setAllTags] = useState(["hoge", "fuga", "foo"]);
  const handleSelect = (value: string) => {
    console.log("select");
    attachTag(old => [...old, value]);
  };
  const handleDetach = (value: string) => {
    attachTag(old => old.filter(t => t != value));
  };
  const handleCreate = (value: string) => {
    console.log("create!");
    attachTag(old => [...old, value]);
    setAllTags(old => [...old, value]);
  };
  return (
    <TagGroup
      attachedTags={attachedTags}
      allTags={allTags}
      onSelect={handleSelect}
      onTagCreate={handleCreate}
      onTagRemove={handleDetach}
      title="Default"
      icon="cancel"
    />
  );
};
