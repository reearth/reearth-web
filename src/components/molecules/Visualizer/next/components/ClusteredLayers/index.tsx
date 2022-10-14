import { ComponentType, useMemo, useCallback, ReactNode } from "react";

import { Atom } from "../../atoms";
import type { Layer } from "../../types";
import LayerComponent, { type CommonProps, type Props as LayerProps } from "../Layer";

export type Props = {
  layers?: Layer[];
  atomMap?: Map<string, Atom>;
  overrides?: Record<string, Record<string, any>>;
  selectedLayerId?: string;
  isHidden?: (id: string) => boolean;
  clusters?: Cluster[];
  clusterComponent?: ComponentType<ClusterProps>;
  Feature?: LayerProps["Feature"];
} & Omit<CommonProps, "isSelected" | "isHidden">;

export type Cluster = {
  id: string;
  property?: any;
  layers?: string[];
};

export type ClusterProps = {
  cluster: Cluster;
  children?: ReactNode;
};

export default function ClusteredLayers({
  clusters,
  clusterComponent,
  layers,
  atomMap,
  selectedLayerId,
  isHidden,
  overrides,
  ...props
}: Props): JSX.Element | null {
  const Cluster = clusterComponent;
  const clusteredLayers = useMemo<Set<string>>(
    () => new Set(clusters?.flatMap(c => (c.layers ?? []).filter(Boolean))),
    [clusters],
  );

  const renderLayer = useCallback(
    (layer: Layer) => {
      const a = atomMap?.get(layer.id);
      return !layer.id || !a ? null : (
        <LayerComponent
          key={layer.id}
          {...props}
          layer={layer}
          atom={a}
          overrides={overrides?.[layer.id]}
          isSelected={!!selectedLayerId && selectedLayerId == layer.id}
          isHidden={isHidden?.(layer.id)}
        />
      );
    },
    [atomMap, isHidden, overrides, props, selectedLayerId],
  );

  return (
    <>
      {Cluster &&
        clusters
          ?.filter(cluster => !!cluster.id)
          .map(cluster => (
            <Cluster key={cluster.id} cluster={cluster}>
              {layers?.filter(layer => cluster?.layers?.some(l => l === layer.id)).map(renderLayer)}
            </Cluster>
          ))}
      {layers?.filter(layer => !clusteredLayers.has(layer.id)).map(renderLayer)}
    </>
  );
}
