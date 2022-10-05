import { forwardRef } from "react";

import type { Layer } from "../../types";
import LayerComponent, { type CommonProps, type Props as LayerProps } from "../Layer";

import useHooks, { type Ref } from "./hooks";

export type { CommonProps, FeatureComponentProps, Layer, LayerSimple } from "../Layer";
export type { LazyLayer, Ref } from "./hooks";

export type Props = {
  layers?: Layer[];
  overriddenProperties?: Record<string, Record<string, any>>;
  Feature?: LayerProps["Feature"];
} & CommonProps;

const Layers: React.ForwardRefRenderFunction<Ref, Props> = (
  { layers, overriddenProperties, ...props },
  ref,
) => {
  const { atomsMap, flattenedLayers } = useHooks({ layers, ref });

  return (
    <>
      {flattenedLayers?.map(layer => (
        <LayerComponent
          key={layer.id}
          {...props}
          layer={layer}
          atoms={atomsMap.get(layer.id)}
          overriddenProperties={overriddenProperties?.[layer.id]}
        />
      ))}
    </>
  );
};

export default forwardRef(Layers);
