import { type FeatureComponentConfig } from "../utils";

import { useMVT, useWMS } from "./hooks";
import type { Props } from "./types";

export default function Raster({ isVisible, layer, property, onFeatureFetch }: Props) {
  useWMS({ isVisible, layer, property });
  useMVT({ isVisible, layer, property, onFeatureFetch });

  return null;
}

export const config: FeatureComponentConfig = {
  noFeature: true,
};
