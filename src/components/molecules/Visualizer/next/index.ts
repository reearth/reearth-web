import { detailedDiff } from "deep-object-diff";
import { useMemo } from "react";
import { usePrevious } from "react-use";

import type { ComputedLayer, ComputedLayerState, Data, Layer } from "./types";

export * from "./types";

type Props = {
  layers: Layer[];
};

type Output = {
  context: Context;
  layers: ComputedLayer[];
};

export type Context = {
  layers: Layer[];
  data: Map<string, Data>;
  temporalLayers: Map<string, Layer[]>;
  computedLayers: ComputedLayer[];
  computedLayerMap: Map<string, ComputedLayer>;
  layerStatus: Map<string, ComputedLayerState>;
};

export default ({ layers }: Props): Output => {
  const prevLayers = usePrevious(layers);
  const _diff = useMemo(() => detailedDiff(prevLayers ?? [], layers), [prevLayers, layers]);

  // calc diff
  // new layer -> eval (request data fetch)
  // updated layees -> eval (request data fetch)
  //   data (url, type) -> purge cache?
  //   property for feature types
  //   infobox
  // deleted layers -> delete layers and data, cancel data fetch

  // data fetched -> eval
  // eval completed -> output computed layers

  throw new Error("wip");

  // return {};
};
