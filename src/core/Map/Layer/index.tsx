import { ComponentType } from "react";

import type {
  DataRange,
  Feature,
  ComputedLayer,
  Layer,
  DataType,
  ComputedFeature,
} from "../../mantle";

import useHooks, { type Atoms, type EvalFeature } from "./hooks";

export type { EvalFeature } from "./hooks";

export type { Layer, LayerSimple, ComputedFeature } from "../types";

export type FeatureComponentType = ComponentType<FeatureComponentProps>;

export type CommonProps = {
  isBuilt?: boolean;
  isEditable?: boolean;
  isHidden?: boolean;
  isSelected?: boolean;
  meta?: Record<string, unknown>;
};

export type FeatureComponentProps = {
  layer: ComputedLayer;
  sceneProperty?: any;
  onFeatureRequest?: (range: DataRange) => void;
  onFeatureFetch?: (features: Feature[]) => void;
  onComputedFeatureFetch?: (feature: Feature[], computed: ComputedFeature[]) => void;
  onFeatureDelete?: (features: string[]) => void;
  evalFeature: EvalFeature;
} & CommonProps;

export type Props = {
  layer?: Layer;
  atom?: Atoms;
  overrides?: Record<string, any>;
  delegatedDataTypes?: DataType[];
  sceneProperty?: any;
  selectedFeature?: ComputedFeature;
  /** Feature component should be injected by a map engine. */
  Feature?: ComponentType<FeatureComponentProps>;
} & CommonProps;

export default function LayerComponent({
  Feature,
  layer,
  atom,
  overrides,
  delegatedDataTypes,
  selectedFeature,
  ...props
}: Props): JSX.Element | null {
  const {
    computedLayer,
    handleFeatureDelete,
    handleFeatureFetch,
    handleComputedFeatureFetch,
    handleFeatureRequest,
    evalFeature,
  } = useHooks({
    layer: Feature ? layer : undefined,
    atom,
    overrides,
    delegatedDataTypes,
    selected: props.isSelected,
    selectedFeature,
  });

  return layer && computedLayer && Feature ? (
    <Feature
      layer={computedLayer}
      onFeatureDelete={handleFeatureDelete}
      onFeatureFetch={handleFeatureFetch}
      onComputedFeatureFetch={handleComputedFeatureFetch}
      onFeatureRequest={handleFeatureRequest}
      evalFeature={evalFeature}
      {...props}
    />
  ) : null;
}
