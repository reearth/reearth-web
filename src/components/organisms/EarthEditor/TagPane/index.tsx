import React from "react";

import Loading from "@reearth/components/atoms/Loading";
import TagPaneMolecule from "@reearth/components/molecules/EarthEditor/TagPane";

import useHooks, { Mode } from "./hooks";

export type Props = {
  className?: string;
  mode: Mode;
};

const TagPane: React.FC<Props> = ({ className, mode }) => {
  const { loading, ...props } = useHooks({ mode });
  return loading ? <Loading /> : <TagPaneMolecule className={className} mode={mode} {...props} />;
};

export default TagPane;
