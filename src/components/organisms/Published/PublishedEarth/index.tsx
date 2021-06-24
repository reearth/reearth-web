import React from "react";

import Visualizer from "@reearth/components/molecules/Visualizer";

import useHooks from "./hooks";

export interface Props {
  className?: string;
  alias?: string;
}

const Published: React.FC<Props> = ({ alias }) => {
  const { sceneProperty, layers, widgets, ready } = useHooks(alias);

  return (
    <>
      <Visualizer
        engine="cesium"
        primitives={layers}
        widgets={widgets}
        sceneProperty={sceneProperty}
        ready={ready}
        isBuilt
      />
    </>
  );
};

export default Published;
