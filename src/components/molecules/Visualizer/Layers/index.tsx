import React from "react";

import { SceneProperty } from "../Engine";
import Cluster from "../Engine/Cesium/cluster";
import P from "../Primitive";

import { LayerStore } from "./store";

export type { Layer } from "../Primitive";

export type Props = {
  pluginProperty?: { [key: string]: any };
  sceneProperty?: SceneProperty;
  isEditable?: boolean;
  isBuilt?: boolean;
  pluginBaseUrl?: string;
  layers?: LayerStore;
  selectedLayerId?: string;
  overriddenProperties?: { [id in string]: any };
  isLayerHidden?: (id: string) => boolean;
};

export { LayerStore, empty as emptyLayerStore } from "./store";

export default function Layers({
  pluginProperty,
  sceneProperty,
  isEditable,
  isBuilt,
  pluginBaseUrl,
  layers,
  selectedLayerId,
  overriddenProperties,
  isLayerHidden,
}: Props): JSX.Element | null {
  return (
    <>
      {sceneProperty?.clusters?.map(cluster => (
        <Cluster
          key={cluster.id}
          cluster={cluster}
          clusterLayers={sceneProperty.cluster_layers}
          layers={layers}
          pluginProperty={pluginProperty}
          isEditable={isEditable}
          isBuilt={isBuilt}
          pluginBaseUrl={pluginBaseUrl}
          selectedLayerId={selectedLayerId}
          overriddenProperties={overriddenProperties}
          isLayerHidden={isLayerHidden}></Cluster>
      ))}
      {layers?.flattenLayersRaw
        ?.filter(
          layer =>
            !sceneProperty?.cluster_layers?.some(
              clusterLayer => clusterLayer.cluster_layer === layer.id,
            ),
        )
        .map(layer =>
          !layer.isVisible || !!layer.children ? null : (
            <P
              key={layer.id}
              layer={layer}
              sceneProperty={sceneProperty}
              pluginProperty={
                layer.pluginId && layer.extensionId
                  ? pluginProperty?.[`${layer.pluginId}/${layer.extensionId}`]
                  : undefined
              }
              isHidden={isLayerHidden?.(layer.id)}
              isEditable={isEditable}
              isBuilt={isBuilt}
              isSelected={!!selectedLayerId && selectedLayerId === layer.id}
              pluginBaseUrl={pluginBaseUrl}
              overriddenProperties={overriddenProperties}
            />
          ),
        )}
    </>
  );
}
