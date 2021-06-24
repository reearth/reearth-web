import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { useDrop, DropOptions } from "@reearth/util/use-dnd";

import type { Ref as EngineRef } from "./Engine";
import type { Primitive } from ".";
import useCommonAPI from "./commonApi";

export default ({
  rootLayerId,
  isEditable,
  isBuilt,
  primitives,
  selectedPrimitiveId: outerSelectedPrimitiveId,
  selectedBlockId: outerSelectedBlockId,
  onPrimitiveSelect,
  onBlockSelect,
}: {
  rootLayerId?: string;
  isEditable?: boolean;
  isBuilt?: boolean;
  primitives?: Primitive[];
  selectedPrimitiveId?: string;
  selectedBlockId?: string;
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

  const commonAPI = useCommonAPI({
    engineRef,
    primitives,
    onPrimitiveSelect: selectPrimitive,
  });

  return {
    engineRef,
    wrapperRef,
    isDroppable,
    commonAPI,
    selectedPrimitiveId,
    selectedPrimitive,
    selectedBlockId,
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
