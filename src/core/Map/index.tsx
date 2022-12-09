import useHooks from "./hooks";
import Layers, { type Props as LayersProps } from "./Layers";
import { Engine, EngineProps } from "./types";

export * from "./types";

export type {
  NaiveLayer,
  LazyLayer,
  FeatureComponentType,
  FeatureComponentProps,
  ClusterProperty,
} from "./Layers";

export type Props = {
  engines?: Record<string, Engine>;
  engine?: string;
} & Omit<LayersProps, "Feature" | "clusterComponent"> &
  EngineProps;

export default function Map({
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
  ...props
}: Props): JSX.Element | null {
  const currentEngine = engine ? engines?.[engine] : undefined;
  const Engine = currentEngine?.component;
  const { engineRef } = useHooks();

  return Engine ? (
    <Engine
      ref={engineRef}
      isBuilt={isBuilt}
      isEditable={isEditable}
      property={sceneProperty}
      selectedLayerId={selectedLayerId}
      {...props}>
      <Layers
        clusters={clusters}
        hiddenLayers={hiddenLayers}
        isBuilt={isBuilt}
        isEditable={isEditable}
        layers={layers}
        overrides={overrides}
        sceneProperty={sceneProperty}
        selectedLayerId={selectedLayerId}
        Feature={currentEngine?.featureComponent}
        clusterComponent={currentEngine?.clusterComponent}
      />
    </Engine>
  ) : null;
}
