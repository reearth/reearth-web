import { forwardRef, type ForwardRefRenderFunction } from "react";

import type { Layer } from "../../types";
import LayerComponent, { type CommonProps, type Props as LayerProps } from "../Layer";

import useHooks, { type Ref } from "./hooks";

export type { CommonProps, FeatureComponentProps, Layer, LayerSimple } from "../Layer";
export type { LazyLayer, Ref } from "./hooks";

export type Props = {
  layers?: Layer[];
  overrides?: Record<string, Record<string, any>>;
  Feature?: LayerProps["Feature"];
} & CommonProps;

const Layers: ForwardRefRenderFunction<Ref, Props> = ({ layers, overrides, ...props }, ref) => {
  const { atomsMap, flattenedLayers } = useHooks({ layers, ref });

  return (
    <>
      {flattenedLayers?.map(layer => {
        const atoms = atomsMap.get(layer.id);
        if (!atoms) return null;
        return (
          <LayerComponent
            key={layer.id}
            {...props}
            layer={layer}
            atoms={atoms}
            overrides={overrides?.[layer.id]}
          />
        );
      })}
    </>
  );
};

export default forwardRef(Layers);
