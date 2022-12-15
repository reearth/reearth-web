import { useImperativeHandle, useRef, type Ref, useState, useEffect, useCallback } from "react";

import { MapRef, mapRef } from "./ref";
import { EngineRef, LayersRef, SelectLayerOptions } from "./types";

export type { MapRef } from "./ref";

export default function ({
  ref,
  selectedLayerId,
  onLayerSelect,
}: {
  ref: Ref<MapRef>;
  selectedLayerId?: string;
  onLayerSelect?: (id: string | undefined, options?: SelectLayerOptions) => void;
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
    (id?: string, options?: SelectLayerOptions) => {
      selectLayer(id);
      onLayerSelect?.(id, options);
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
