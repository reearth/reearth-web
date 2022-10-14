import { forwardRef, type ForwardRefRenderFunction } from "react";

import ClusteredLayers, { type Props as ClusteredLayerProps } from "../ClusteredLayers";

import useHooks, { type Ref } from "./hooks";

export type { CommonProps, FeatureComponentProps, Layer, LayerSimple } from "../Layer";
export type { LazyLayer, Ref } from "./hooks";

export type Props = Omit<ClusteredLayerProps, "atomMap">;

const Layers: ForwardRefRenderFunction<Ref, Props> = ({ layers, ...props }, ref) => {
  const { atomMap, flattenedLayers } = useHooks({ layers, ref });

  return <ClusteredLayers layers={flattenedLayers} atomMap={atomMap} {...props} />;
};

export default forwardRef(Layers);
