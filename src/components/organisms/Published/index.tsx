import React from "react";

import Visualizer from "@reearth/components/molecules/Visualizer";
import Error from "@reearth/components/molecules/Published/Error";

import useHooks from "./hooks";

export interface Props {
  className?: string;
  alias?: string;
}

const Published: React.FC<Props> = ({ className, alias }) => {
  const { alias: actualAlias, sceneProperty, layers, widgets, ready, error } = useHooks(alias);

  return error ? (
    <Error alias={actualAlias} />
  ) : (
    <Visualizer
      className={className}
      engine="cesium"
      primitives={layers}
      widgets={widgets}
      sceneProperty={sceneProperty}
      ready={ready}
      isBuilt
    />
  );
};

export default Published;
