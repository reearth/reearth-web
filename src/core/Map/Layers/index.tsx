import { forwardRef, type ForwardRefRenderFunction } from "react";

import ClusteredLayers, { type Props as ClusteredLayerProps } from "../ClusteredLayers";

import useHooks, { type Ref } from "./hooks";

export type {
  CommonProps,
  FeatureComponentProps,
  FeatureComponentType,
  Layer,
  LayerSimple,
} from "../Layer";
export type { LazyLayer, Ref, NaiveLayer } from "./hooks";
export type {
  ClusterComponentType,
  ClusterComponentProps,
  ClusterProperty,
} from "../ClusteredLayers";

export type Props = Omit<ClusteredLayerProps, "atomMap" | "isHidden"> & {
  hiddenLayers?: string[];
  selectedLayerId?: string;
  onLayerSelect?: (layerId: string | undefined) => void;
};

const Layers: ForwardRefRenderFunction<Ref, Props> = (
  { layers, hiddenLayers, selectedLayerId, onLayerSelect, ...props },
  ref,
) => {
  const { atomMap, flattenedLayers, isHidden } = useHooks({
    layers,
    ref,
    hiddenLayers,
    selectedLayerId,
    onLayerSelect,
  });

  return (
    <ClusteredLayers {...props} layers={flattenedLayers} atomMap={atomMap} isHidden={isHidden} />
  );
};

export default forwardRef(Layers);
