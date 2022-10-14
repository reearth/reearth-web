import { ComponentType, forwardRef, type ForwardRefRenderFunction } from "react";

import type { Layer } from "../../types";
import ClusteredLayers, { type Cluster, type ClusterProps } from "../ClusteredLayers";
import type { CommonProps, Props as LayerProps } from "../Layer";

import useHooks, { type Ref } from "./hooks";

export type { CommonProps, FeatureComponentProps, Layer, LayerSimple } from "../Layer";
export type { LazyLayer, Ref } from "./hooks";

export type Props = {
  layers?: Layer[];
  overrides?: Record<string, Record<string, any>>;
  Feature?: LayerProps["Feature"];
  clusters?: Cluster[];
  clusterComponent?: ComponentType<ClusterProps>;
} & CommonProps;

const Layers: ForwardRefRenderFunction<Ref, Props> = ({ layers, overrides, ...props }, ref) => {
  const { atomMap, flattenedLayers } = useHooks({ layers, ref });

  return (
    <ClusteredLayers layers={flattenedLayers} atomMap={atomMap} overrides={overrides} {...props} />
  );
};

export default forwardRef(Layers);
