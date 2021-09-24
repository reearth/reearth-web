import React from "react";

import P from "../Primitive";

import LayerStore from "./store";

export type { Layer } from "../Primitive";

export type Props = {
  pluginProperty?: { [key: string]: any };
  sceneProperty?: any;
  isEditable?: boolean;
  isBuilt?: boolean;
  pluginBaseUrl?: string;
  layers?: LayerStore;
  selectedLayerId?: string;
  isLayerHidden?: (id: string) => boolean;
};

export { default as LayerStore, empty as emptyLayerStore } from "./Store";

export default function Layers({
  pluginProperty,
  sceneProperty,
  isEditable,
  isBuilt,
  pluginBaseUrl,
  layers,
  selectedLayerId,
  isLayerHidden,
}: Props): JSX.Element | null {
  return (
    <>
      {layers?.flattenLayers?.map(layer =>
        !layer.isVisible ? null : (
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
          />
        ),
      )}
    </>
  );
}
