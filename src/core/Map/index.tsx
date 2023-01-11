import { forwardRef, type Ref } from "react";

import useHooks, { MapRef } from "./hooks";
import Layers, { type Props as LayersProps } from "./Layers";
import type { Engine, EngineProps } from "./types";

export * from "./types";

export type {
  NaiveLayer,
  LazyLayer,
  FeatureComponentType,
  FeatureComponentProps,
  ClusterProperty,
  Layer,
  LayerSelectionReason,
  Cluster,
} from "./Layers";

export type { MapRef as Ref } from "./hooks";

export type Props = {
  engines?: Record<string, Engine>;
  engine?: string;
} & Omit<LayersProps, "Feature" | "clusterComponent" | "selectionReason" | "delegatedDataTypes"> &
  Omit<EngineProps, "selectionReason" | "onLayerSelect">;

function Map(
  {
    engines,
    engine,
    isBuilt,
    isEditable,
    sceneProperty,
    clusters,
    hiddenLayers,
    layers,
    overrides,
    selectedLayerId,
    layerSelectionReason,
    onLayerSelect,
    ...props
  }: Props,
  ref: Ref<MapRef>,
): JSX.Element | null {
  const currentEngine = engine ? engines?.[engine] : undefined;
  const Engine = currentEngine?.component;
  const { engineRef, layersRef, selectedLayer, handleLayerSelect, handleEngineLayerSelect } =
    useHooks({
      ref,
      selectedLayerId,
      onLayerSelect,
    });

  return Engine ? (
    <Engine
      ref={engineRef}
      isBuilt={isBuilt}
      isEditable={isEditable}
      property={sceneProperty}
      selectedLayerId={selectedLayer[0]}
      layerSelectionReason={selectedLayer[2]}
      onLayerSelect={handleEngineLayerSelect}
      {...props}>
      <Layers
        ref={layersRef}
        clusters={clusters}
        hiddenLayers={hiddenLayers}
        isBuilt={isBuilt}
        isEditable={isEditable}
        layers={layers}
        overrides={overrides}
        sceneProperty={sceneProperty}
        selectedLayerId={selectedLayerId}
        selectionReason={layerSelectionReason}
        Feature={currentEngine?.featureComponent}
        clusterComponent={currentEngine?.clusterComponent}
        delegatedDataTypes={currentEngine.delegatedDataTypes}
        onLayerSelect={handleLayerSelect}
      />
    </Engine>
  ) : null;
}

export default forwardRef(Map);
