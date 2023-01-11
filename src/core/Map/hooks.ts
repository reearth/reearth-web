import { useImperativeHandle, useRef, type Ref, useState, useCallback } from "react";

import { type MapRef, mapRef } from "./ref";
import type { EngineRef, LayersRef, Layer, LayerSelectionReason } from "./types";

export type { MapRef } from "./ref";

export default function ({
  ref,
  onLayerSelect,
}: {
  ref: Ref<MapRef>;
  selectedLayerId?: string;
  onLayerSelect?: (
    id: string | undefined,
    layer: Layer | undefined,
    options?: LayerSelectionReason,
  ) => void;
}) {
  const engineRef = useRef<EngineRef>(null);
  const layersRef = useRef<LayersRef>(null);

  useImperativeHandle(
    ref,
    () =>
      mapRef({
        engineRef,
        layersRef,
      }),
    [],
  );

  const [selectedLayer, selectLayer] = useState<
    [string | undefined, Layer | undefined, LayerSelectionReason | undefined]
  >([undefined, undefined, undefined]);

  const handleLayerSelect = useCallback(
    (id: string | undefined, layer: Layer | undefined, reason?: LayerSelectionReason) => {
      selectLayer([id, layer, reason]);
      onLayerSelect?.(id, layer, reason);
    },
    [onLayerSelect],
  );

  return {
    engineRef,
    layersRef,
    selectedLayer,
    handleLayerSelect,
  };
}
