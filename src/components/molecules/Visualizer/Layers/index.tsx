import { ComponentType, useMemo, useCallback } from "react";

import { ClusterProperty, ClusterProps } from "../Engine";

import P from "./Primitive";
import type { LayerStore, Layer } from "./store";

export type { Layer } from "./Primitive";

export type Props = {
  clusterProperty?: ClusterProperty[];
  sceneProperty?: any;
  isEditable?: boolean;
  isBuilt?: boolean;
  layers?: LayerStore;
  selectedLayerId?: string;
  overriddenProperties?: { [id in string]: any };
  clusterComponent?: ComponentType<ClusterProps>;
  isLayerHidden?: (id: string) => boolean;
};

export { LayerStore, empty as emptyLayerStore } from "./store";

export default function Layers({
  sceneProperty,
  clusterProperty,
  isEditable,
  isBuilt,
  layers,
  selectedLayerId,
  overriddenProperties,
  isLayerHidden,
  clusterComponent,
}: Props): JSX.Element | null {
  const Cluster = clusterComponent;
  const clusteredLayers = useMemo<Set<string>>(
    () =>
      new Set(
        clusterProperty?.flatMap(c =>
          (c.layers ?? []).map(l => l.layer).filter((l): l is string => !!l),
        ),
      ),
    [clusterProperty],
  );

  const renderLayer = useCallback(
    (layer: Layer) => {
      return !layer.id || !layer.isVisible || !!layer.children ? null : (
        <P
          key={layer.id}
          layer={layer}
          sceneProperty={sceneProperty}
          overriddenProperties={overriddenProperties}
          isHidden={isLayerHidden?.(layer.id)}
          isEditable={isEditable}
          isBuilt={isBuilt}
          isSelected={!!selectedLayerId && selectedLayerId === layer.id}
        />
      );
    },
    [isBuilt, isEditable, isLayerHidden, overriddenProperties, sceneProperty, selectedLayerId],
  );

  return (
    <>
      {Cluster &&
        clusterProperty
          ?.filter(cluster => !!cluster.id)
          .map(cluster => (
            <Cluster key={cluster.id} property={cluster}>
              {layers?.flattenLayersRaw
                ?.filter(layer => cluster?.layers?.some(l => l.layer === layer.id))
                .map(renderLayer)}
            </Cluster>
          ))}
      {layers?.flattenLayersRaw?.filter(layer => !clusteredLayers.has(layer.id)).map(renderLayer)}
    </>
  );
}
