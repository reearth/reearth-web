import { ComponentType, useMemo } from "react";

import useHooks from "./hooks";
import type { DataRange, Feature, Layer as LayerType, TreeLayer as TreeLayerType } from "./types";
import { flattenLayers } from "./utils";

export * from "./types";

export type FeatureComponentProps = {
  layer: LayerType;
  features: Feature[];
  onFeatureRequest?: (range: DataRange) => Promise<Feature[]>;
  onFeatureFetch?: (features: Feature[]) => void;
  onFeatureDelete?: (features: string[]) => void;
};

export type CommonProps = {
  /** Feature component should be injected by a map engine. */
  Feature?: ComponentType<FeatureComponentProps>;
};

export type LayerProps = {
  layer?: LayerType;
} & CommonProps;

export function Layer({ Feature, layer }: LayerProps): JSX.Element | null {
  const { features, handleFeatureRequest, handleFeatureFetch, handleFeatureDelete } = useHooks(
    Feature ? layer : undefined,
  );

  return layer && features && Feature ? (
    <Feature
      layer={layer}
      features={features}
      onFeatureRequest={handleFeatureRequest}
      onFeatureFetch={handleFeatureFetch}
      onFeatureDelete={handleFeatureDelete}
    />
  ) : null;
}

export type LayersProps = {
  layers?: LayerType[];
} & CommonProps;

export function Layers({ layers, ...props }: LayersProps): JSX.Element | null {
  return (
    <>
      {layers?.map(l => (
        <Layer key={l.id} layer={l} {...props} />
      ))}
    </>
  );
}

export type TreeLayersProps = {
  layers?: TreeLayerType[];
} & CommonProps;

export function TreeLayers({ layers, ...props }: TreeLayersProps): JSX.Element | null {
  const flayers = useMemo(() => flattenLayers(layers), [layers]);
  return <Layers layers={flayers} {...props} />;
}
