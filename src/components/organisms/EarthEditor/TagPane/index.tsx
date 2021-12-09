import React from "react";

import { default as Wrapper } from "@reearth/components/molecules/EarthEditor/TagPane";

import useHooks from "./hooks";

export type Props = {
  className?: string;
};

const TagPane: React.FC<Props> = ({ className }) => {
  const { loading } = useHooks({});
  return <Wrapper />;
};

export default TagPane;
