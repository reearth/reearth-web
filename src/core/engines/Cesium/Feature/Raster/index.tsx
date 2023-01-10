import { type FeatureComponentConfig } from "../utils";

import { useMVT, useWMS } from "./hooks";
import type { Props } from "./types";

export default function Raster({ isVisible, layer, property, onFeatureFetch, evalFeature }: Props) {
  useWMS({ isVisible, layer, property });
  useMVT({ isVisible, layer, property, onFeatureFetch, evalFeature });

  return null;
}

export const config: FeatureComponentConfig = {
  noFeature: true,
};
