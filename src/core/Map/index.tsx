import { forwardRef, type Ref } from "react";

import useHooks, { MapRef } from "./hooks";
import Layers, { type Props as LayersProps } from "./Layers";
import { Engine, EngineProps } from "./types";

export * from "./types";

export type {
  NaiveLayer,
  LazyLayer,
  FeatureComponentType,
  FeatureComponentProps,
  ClusterProperty,
  Layer,
} from "./Layers";

export type { MapRef as Ref } from "./hooks";

export type Props = {
  engines?: Record<string, Engine>;
  engine?: string;
} & Omit<LayersProps, "Feature" | "clusterComponent" | "onLayerSelect"> &
  EngineProps;

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
    onLayerSelect,
    ...props
  }: Props,
  ref: Ref<MapRef>,
): JSX.Element | null {
  const currentEngine = engine ? engines?.[engine] : undefined;
  const Engine = currentEngine?.component;
  const { engineRef, layersRef, selectedLayer, handleLayerSelect } = useHooks({
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
      selectedLayerId={selectedLayer}
      onLayerSelect={handleLayerSelect}
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
        selectedLayerId={selectedLayer}
        Feature={currentEngine?.featureComponent}
        clusterComponent={currentEngine?.clusterComponent}
        delegatedDataTypes={currentEngine.delegatedDataTypes}
        onLayerSelect={handleLayerSelect}
      />
    </Engine>
  ) : null;
}

export default forwardRef(Map);
