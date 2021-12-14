import React from "react";

import Loading from "@reearth/components/atoms/Loading";
import { default as Wrapper } from "@reearth/components/molecules/EarthEditor/TagPane";

import useHooks from "./hooks";

export type Props = {
  className?: string;
};

const TagPane: React.FC<Props> = () => {
  const {
    loading,
    attachedTags,
    handleAddTag,
    handleAddTagGroup,
    handleRemoveTag,
    handleRemoveTagGroup,
    sceneTags,
  } = useHooks();
  return loading ? (
    <Loading />
  ) : (
    <Wrapper
      allTagGroups={sceneTags}
      tagGroups={attachedTags}
      onTagGroupAdd={handleAddTagGroup}
      onTagAdd={handleAddTag}
    />
  );
};

export default TagPane;
