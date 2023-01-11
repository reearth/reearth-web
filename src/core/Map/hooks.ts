import { useImperativeHandle, useRef, type Ref, useState, useEffect, useCallback } from "react";

import { type MapRef, mapRef } from "./ref";
import type { EngineRef, LayersRef, SelectLayerOptions, Layer } from "./types";

export type { MapRef } from "./ref";

export default function ({
  ref,
  selectedLayerId,
  onLayerSelect,
}: {
  ref: Ref<MapRef>;
  selectedLayerId?: string;
  onLayerSelect?: (
    id: string | undefined,
    layer: Layer | undefined,
    options?: SelectLayerOptions,
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

  const [selectedLayer, selectLayer] = useState(selectedLayerId);
  useEffect(() => {
    selectLayer(selectedLayerId);
  }, [selectedLayerId]);

  const handleLayerSelect = useCallback(
    (id: string | undefined, layer: Layer | undefined, options?: SelectLayerOptions) => {
      selectLayer(id);
      onLayerSelect?.(id, layer, options);
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
