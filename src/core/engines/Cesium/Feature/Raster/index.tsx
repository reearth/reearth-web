import type { RasterAppearance } from "../../..";
import { type FeatureComponentConfig, type FeatureProps } from "../utils";

import { useMVT, useWMS } from "./hooks";

export type Props = FeatureProps<Property>;
export type Property = RasterAppearance;

export default function Raster({ isVisible, layer, property, onFeatureFetch }: Props) {
  useWMS({ isVisible, layer, property });
  useMVT({ isVisible, layer, property, onFeatureFetch });

  return null;
}

export const config: FeatureComponentConfig = {
  noFeature: true,
};
