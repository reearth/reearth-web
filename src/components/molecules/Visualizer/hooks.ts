import { useRef, useEffect, useMemo, useState, useCallback, RefObject } from "react";
import { useDrop, DropOptions } from "@reearth/util/use-dnd";

import { Camera } from "@reearth/util/value";
import type { Ref as EngineRef } from "./Engine";
import type { Primitive } from ".";
import { VisualizerContext } from "./context";
import api from "./api";

export default ({
  engineType,
  rootLayerId,
  isEditable,
  isBuilt,
  primitives,
  selectedPrimitiveId: outerSelectedPrimitiveId,
  selectedBlockId: outerSelectedBlockId,
  camera,
  onPrimitiveSelect,
  onBlockSelect,
}: {
  engineType?: string;
  rootLayerId?: string;
  isEditable?: boolean;
  isBuilt?: boolean;
  primitives?: Primitive[];
  selectedPrimitiveId?: string;
  selectedBlockId?: string;
  camera?: Camera;
  onPrimitiveSelect?: (id?: string) => void;
  onBlockSelect?: (id?: string) => void;
}) => {
  const engineRef = useRef<EngineRef>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const { ref: dropRef, isDroppable } = useDrop(
    useMemo(
      (): DropOptions => ({
        accept: ["primitive", "datasetSchema"],
        drop(_item, context) {
          if (!rootLayerId || !isEditable) return;
          const loc = context.position
            ? engineRef.current?.getLocationFromScreenXY(context.position.x, context.position.y)
            : undefined;
          return {
            type: "earth",
            layerId: rootLayerId,
            position: loc ? { lat: loc.lat, lng: loc.lng, height: loc.height } : undefined,
          };
        },
        wrapperRef,
      }),
      [rootLayerId, isEditable],
    ),
  );
  dropRef(wrapperRef);

  const { selectedPrimitive, selectedPrimitiveId, selectPrimitive } = usePrimitiveSelection({
    primitives,
    selectedPrimitiveId: outerSelectedPrimitiveId,
    onPrimitiveSelect,
  });

  const [selectedBlockId, selectBlock] = useInnerState<string>(outerSelectedBlockId, onBlockSelect);

  useEffect(() => {
    if (!isEditable || !isBuilt) {
      selectBlock();
    }
  }, [isEditable, isBuilt, selectBlock]);

  // update cesium
  useEffect(() => {
    engineRef.current?.requestRender();
  });

  const [innerCamera, setInnerCamera] = useState(camera);
  useEffect(() => {
    setInnerCamera(camera);
  }, [camera]);

  const hiddenPrimitivesSet = useMemo(() => new Set<string>(), []);
  const [hiddenPrimitives, setHiddenPrimitives] = useState<string[]>([]);
  const showPrimitive = useCallback(
    (...ids: string[]) => {
      for (const id of ids) {
        hiddenPrimitivesSet.delete(id);
      }
      setHiddenPrimitives(Array.from(hiddenPrimitivesSet.values()));
    },
    [hiddenPrimitivesSet],
  );
  const hidePrimitive = useCallback(
    (...ids: string[]) => {
      for (const id of ids) {
        hiddenPrimitivesSet.add(id);
      }
      setHiddenPrimitives(Array.from(hiddenPrimitivesSet.values()));
    },
    [hiddenPrimitivesSet],
  );

  const visualizerContext = useVisualizerContext({
    engine: engineRef,
    primitives,
    camera: innerCamera,
    selectedPrimitive,
    selectPrimitive,
    showPrimitive,
    hidePrimitive,
  });

  useEffect(() => {
    const c = engineRef.current?.getCamera();
    if (c) {
      setInnerCamera(c);
    }
  }, [engineType]);

  return {
    engineRef,
    wrapperRef,
    isDroppable,
    visualizerContext,
    hiddenPrimitives,
    selectedPrimitiveId,
    selectedPrimitive,
    selectedBlockId,
    innerCamera,
    setInnerCamera,
    selectPrimitive,
    selectBlock,
  };
};

function usePrimitiveSelection({
  primitives,
  selectedPrimitiveId: outerSelectedPrimitiveId,
  onPrimitiveSelect,
}: {
  primitives?: Primitive[];
  selectedPrimitiveId?: string;
  onPrimitiveSelect?: (id?: string) => void;
}) {
  const [selectedPrimitiveId, innerSelectPrimitive] = useState<[id: string, reason?: string]>();

  const selectedPrimitive = useMemo(
    () =>
      selectedPrimitiveId?.[0]
        ? primitives?.find(p => p.id === selectedPrimitiveId?.[0])
        : undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedPrimitiveId?.[0], primitives],
  );

  const selectPrimitive = useCallback(
    (id?: string, reason?: string) => {
      innerSelectPrimitive(s =>
        !id ? undefined : s?.[0] === id && s?.[1] === reason ? s : [id, reason],
      );
      onPrimitiveSelect?.(id);
    },
    [onPrimitiveSelect],
  );

  useEffect(() => {
    if (outerSelectedPrimitiveId) {
      selectPrimitive(outerSelectedPrimitiveId);
    } else {
      selectPrimitive(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outerSelectedPrimitiveId]); // ignore onPrimitiveSelect

  return {
    selectedPrimitive,
    selectedPrimitiveId,
    selectPrimitive,
  };
}

function useInnerState<T>(
  value: T | undefined,
  onChange: ((value?: T) => void) | undefined,
): readonly [T | undefined, (value?: T) => void] {
  const [innerState, innerSetState] = useState<T>();

  const setState = useCallback(
    (newValue?: T) => {
      innerSetState(newValue);
      onChange?.(newValue);
    },
    [onChange],
  );

  useEffect(() => {
    innerSetState(value);
  }, [value]);

  return [innerState, setState];
}

function useVisualizerContext({
  engine,
  camera,
  primitives = [],
  selectedPrimitive,
  showPrimitive,
  hidePrimitive,
  selectPrimitive,
}: {
  engine: RefObject<EngineRef>;
  camera?: Camera;
  primitives?: Primitive[];
  selectedPrimitive: Primitive | undefined;
  showPrimitive: (...id: string[]) => void;
  hidePrimitive: (...id: string[]) => void;
  selectPrimitive: (id?: string) => void;
}): VisualizerContext {
  const pluginAPI = useMemo(
    () =>
      api({
        engine: () => engine.current,
        hidePrimitive,
        selectPrimitive: id => {
          selectPrimitive?.(id);
        },
        showPrimitive,
      }),
    [engine, hidePrimitive, selectPrimitive, showPrimitive],
  );

  const ctx = useMemo((): VisualizerContext => {
    return {
      engine: engine.current ?? undefined,
      camera,
      primitives,
      selectedPrimitive,
      pluginAPI,
    };
  }, [camera, engine, pluginAPI, primitives, selectedPrimitive]);

  return ctx;
}
