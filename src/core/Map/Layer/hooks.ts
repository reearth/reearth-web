import { useAtom } from "jotai";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";

import { computeAtom, DataType, evalFeature } from "../../mantle";
import type { Atom, DataRange, Layer, ComputedFeature, Feature } from "../types";

export type { Atom as Atoms } from "../types";

export const createAtom = computeAtom;

export type EvalFeature = (layer: Layer, feature: Feature) => ComputedFeature | undefined;

export default function useHooks({
  layer,
  atom,
  overrides,
  delegatedDataTypes,
  selected,
  selectedFeature,
}: {
  layer: Layer | undefined;
  atom: Atom | undefined;
  overrides?: Record<string, any>;
  delegatedDataTypes?: DataType[];
  selected?: boolean;
  selectedFeature?: ComputedFeature;
}) {
  const [computedLayer, set] = useAtom(useMemo(() => atom ?? createAtom(), [atom]));
  const writeFeatures = useCallback(
    (features: Feature[]) => set({ type: "writeFeatures", features }),
    [set],
  );
  const writeComputedFeatures = useCallback(
    (feature: Feature[], computed: ComputedFeature[]) =>
      set({ type: "writeComputedFeatures", value: { feature, computed } }),
    [set],
  );
  const requestFetch = useCallback(
    (range: DataRange) => set({ type: "requestFetch", range }),
    [set],
  );
  const deleteFeatures = useCallback(
    (features: string[]) => set({ type: "deleteFeatures", features }),
    [set],
  );
  const forceUpdateFeatures = useCallback(() => set({ type: "forceUpdateFeatures" }), [set]);

  useLayoutEffect(() => {
    set({ type: "updateDelegatedDataTypes", delegatedDataTypes: delegatedDataTypes ?? [] });
  }, [delegatedDataTypes, set]);

  useLayoutEffect(() => {
    set({
      type: "override",
      overrides,
    });
  }, [set, overrides]);

  useLayoutEffect(() => {
    set({
      type: "setLayer",
      layer:
        typeof layer?.visible === "undefined" || layer?.type === null || layer?.type
          ? layer
          : undefined,
    });
  }, [layer, set]);

  const intervalId = useRef<number>();
  useLayoutEffect(() => {
    const data = layer?.type === "simple" ? layer.data : undefined;

    if (!data?.updateInterval || !data?.url) {
      return;
    }

    intervalId.current = window.setInterval(forceUpdateFeatures, data.updateInterval);

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, [layer, forceUpdateFeatures]);

  // select event
  const selectEvent = layer?.type === "simple" && layer.events?.select;
  useEffect(() => {
    if (!selected || !selectEvent) return;
    if (selectEvent.openUrl) {
      const url = selectEvent.openUrl.urlKey
        ? (selectedFeature ? selectedFeature.properties : computedLayer?.properties)?.[
            selectEvent.openUrl.urlKey
          ]
        : selectEvent.openUrl.url;
      if (typeof url === "string" && url) {
        window.open(url, "_blank", "noreferrer");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]); // only selected

  return {
    computedLayer,
    handleFeatureRequest: requestFetch,
    handleFeatureFetch: writeFeatures,
    handleComputedFeatureFetch: writeComputedFeatures,
    handleFeatureDelete: deleteFeatures,
    evalFeature,
  };
}
