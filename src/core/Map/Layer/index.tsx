import { ComponentType } from "react";

import type { DataRange, Feature, ComputedLayer, Layer } from "../../mantle";

import useHooks, { type Atoms } from "./hooks";

export type { Layer, LayerSimple } from "../../mantle";

export type FeatureComponentType = ComponentType<FeatureComponentProps>;

export type CommonProps = {
  isBuilt?: boolean;
  isEditable?: boolean;
  isHidden?: boolean;
  isSelected?: boolean;
  sceneProperty?: any;
};

export type FeatureComponentProps = {
  layer: ComputedLayer;
  onFeatureRequest?: (range: DataRange) => void;
  onFeatureFetch?: (features: Feature[]) => void;
  onFeatureDelete?: (features: string[]) => void;
} & CommonProps;

export type Props = {
  layer?: Layer;
  atom?: Atoms;
  overrides?: Record<string, any>;
  /** Feature component should be injected by a map engine. */
  Feature?: ComponentType<FeatureComponentProps>;
} & CommonProps;

export default function LayerComponent({
  Feature,
  layer,
  atom: atoms,
  overrides,
  ...props
}: Props): JSX.Element | null {
  const { computedLayer, handleFeatureDelete, handleFeatureFetch, handleFeatureRequest } = useHooks(
    Feature ? layer : undefined,
    atoms,
    overrides,
  );

  return layer && computedLayer && Feature ? (
    <Feature
      layer={computedLayer}
      onFeatureDelete={handleFeatureDelete}
      onFeatureFetch={handleFeatureFetch}
      onFeatureRequest={handleFeatureRequest}
      {...props}
    />
  ) : null;
}
