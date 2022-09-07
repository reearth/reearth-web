import { ComponentType } from "react";

import useHooks from "./hooks";
import type { DataRange, Feature, ComputedLayer, Layer } from "./types";

export * from "./types";

export type FeatureComponentType = ComponentType<FeatureComponentProps>;

export type FeatureComponentProps = {
  layer: ComputedLayer;
  isBuilt?: boolean;
  isEditable?: boolean;
  isHidden?: boolean;
  isSelected?: boolean;
  sceneProperty?: any;
  overriddenProperties?: Record<string, any>;
  onFeatureRequest?: (range: DataRange) => Promise<Feature[]>;
  onFeatureFetch?: (features: Feature[]) => void;
  onFeatureDelete?: (features: string[]) => void;
};

export type LayerProps = {
  layer?: Layer;
  overriddenProperties?: Record<string, any>;
  /** Feature component should be injected by a map engine. */
  Feature?: ComponentType<FeatureComponentProps>;
} & Omit<
  FeatureComponentProps,
  "layer" | "overriddenProperties" | "onFeatureRequest" | "onFeatureFetch" | "onFeatureDelete"
>;

export function LayerComponent({ Feature, layer, ...props }: LayerProps): JSX.Element | null {
  const { computedLayer, handleFeatureRequest, handleFeatureFetch, handleFeatureDelete } = useHooks(
    Feature ? layer : undefined,
  );

  return layer && computedLayer && Feature ? (
    <Feature
      layer={computedLayer}
      onFeatureRequest={handleFeatureRequest}
      onFeatureFetch={handleFeatureFetch}
      onFeatureDelete={handleFeatureDelete}
      {...props}
    />
  ) : null;
}

export type LayersProps = {
  layers?: Layer[];
  overriddenProperties: Record<string, Record<string, any>>;
} & Omit<LayerProps, "layer">;

export function LayersComponment({
  layers,
  overriddenProperties,
  ...props
}: LayersProps): JSX.Element | null {
  return (
    <>
      {layers?.map(layer => (
        <LayerComponent
          key={layer.id}
          {...props}
          layer={layer}
          overriddenProperties={overriddenProperties[layer.id]}
        />
      ))}
    </>
  );
}
