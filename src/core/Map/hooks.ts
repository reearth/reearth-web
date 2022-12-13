import {
  type RefObject,
  useImperativeHandle,
  useRef,
  type Ref,
  useState,
  useEffect,
  useCallback,
} from "react";

import { EngineRef, LayersRef, SelectLayerOptions } from "./types";

export type MapRef = {
  engine: RefObject<EngineRef>;
  layers: RefObject<LayersRef>;
};

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
    () => ({
      engine: engineRef,
      layers: layersRef,
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
