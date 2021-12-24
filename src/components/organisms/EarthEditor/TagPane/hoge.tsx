import React from "react";

import TagPaneMolecule from "@reearth/components/molecules/EarthEditor/TagPane";

export type Props = {
  className?: string;
};

const TagPane: React.FC<Props> = ({ className }) => {
  return <TagPaneMolecule mode="layer" />;
};

export default TagPane;
