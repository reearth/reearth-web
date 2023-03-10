import { isEqual } from "lodash-es";
import { memo } from "react";

import { extractSimpleLayer, extractSimpleLayerData, type FeatureComponentConfig } from "../utils";

import { useMVT, useWMS, useWMTS } from "./hooks";
import type { Props } from "./types";

function Raster({
  isVisible,
  layer,
  property,
  onComputedFeatureFetch,
  evalFeature,
  onFeatureDelete,
}: Props) {
  useWMTS({ isVisible, layer, property });
  useWMS({ isVisible, layer, property });
  useMVT({ isVisible, layer, property, evalFeature, onComputedFeatureFetch, onFeatureDelete });

  return null;
}

export default memo(
  Raster,
  (prev, next) =>
    // In Raster component, we only use polygon, so we only check polygon in layer props.
    isEqual(extractSimpleLayer(prev.layer)?.polygon, extractSimpleLayer(next.layer)?.polygon) &&
    isEqual(extractSimpleLayerData(prev.layer), extractSimpleLayerData(next.layer)) &&
    isEqual(prev.property, next.property) &&
    prev.isVisible === next.isVisible &&
    prev.evalFeature === next.evalFeature &&
    prev.onComputedFeatureFetch === next.onComputedFeatureFetch,
);

export const config: FeatureComponentConfig = {
  noFeature: true,
};
