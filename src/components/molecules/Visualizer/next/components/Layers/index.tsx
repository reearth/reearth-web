import { forwardRef, type ForwardRefRenderFunction } from "react";

import ClusteredLayers, { type Props as ClusteredLayerProps } from "../ClusteredLayers";

import useHooks, { type Ref } from "./hooks";

export type { CommonProps, FeatureComponentProps, Layer, LayerSimple } from "../Layer";
export type { LazyLayer, Ref } from "./hooks";

export type Props = Omit<ClusteredLayerProps, "atomMap" | "isHidden"> & {
  hiddenLayers?: string[];
};

const Layers: ForwardRefRenderFunction<Ref, Props> = ({ layers, hiddenLayers, ...props }, ref) => {
  const { atomMap, flattenedLayers, isHidden } = useHooks({ layers, ref, hiddenLayers });

  return (
    <ClusteredLayers {...props} layers={flattenedLayers} atomMap={atomMap} isHidden={isHidden} />
  );
};

export default forwardRef(Layers);
