import React from "react";

import Loading from "@reearth/components/atoms/Loading";
import { default as Wrapper } from "@reearth/components/molecules/EarthEditor/TagPane";

import useHooks from "./hooks";

export type Props = {
  className?: string;
};

const TagPane: React.FC<Props> = () => {
  const { loading, handleCreateTagGroup, handleCreateTagItem, sceneTagGroups } = useHooks();
  return loading ? (
    <Loading />
  ) : (
    <Wrapper
      allTagGroups={sceneTagGroups}
      tagGroups={sceneTagGroups}
      onTagGroupAdd={handleCreateTagGroup}
      onTagAdd={handleCreateTagItem}
    />
  );
};

export default TagPane;
