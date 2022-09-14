import { useLayoutEffect, useMemo } from "react";

import type { Layer } from "../types";

import { createAtoms, type Atoms } from "./hooks";
import LayerComponent, { type CommonProps, Props as LayerProps } from "./Layer";

export type { Layer, FeatureComponentProps } from "./Layer";

export type Props = {
  layers?: Layer[];
  overriddenProperties?: Record<string, Record<string, any>>;
  Feature?: LayerProps["Feature"];
} & CommonProps;

export default function Layers({
  layers,
  overriddenProperties,
  ...props
}: Props): JSX.Element | null {
  const atoms = useMemo<Map<string, Atoms>>(() => new Map(), []);

  useLayoutEffect(() => {
    for (const k of atoms.keys()) {
      if (!layers?.find(l => l.id === k)) {
        atoms.delete(k);
      }
    }
    layers?.forEach(l => {
      if (!atoms.has(l.id)) {
        atoms.set(l.id, createAtoms());
      }
    });
  }, [atoms, layers]);

  return (
    <>
      {layers?.map(layer => (
        <LayerComponent
          key={layer.id}
          {...props}
          layer={layer}
          atoms={atoms.get(layer.id)}
          overriddenProperties={overriddenProperties?.[layer.id]}
        />
      ))}
    </>
  );
}
