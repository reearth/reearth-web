import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { initialize, pageview } from "react-ga";
import { useSet } from "react-use";

import { useDrop, DropOptions } from "@reearth/util/use-dnd";
import { Camera } from "@reearth/util/value";

import type {
  OverriddenInfobox,
  Ref as EngineRef,
  SceneProperty,
  SelectLayerOptions,
} from "./Engine";
import type { Props as InfoboxProps, Block } from "./Infobox";
import type { VisualizerContext } from "./Plugin";
import { CommonReearth, useCommonReearth } from "./Plugin/api";
import type { Layer as RawLayer } from "./Primitive";

declare global {
  interface Window {
    reearth?: CommonReearth;
  }
}

export type Layer = RawLayer & {
  infoboxEditable?: boolean;
};

export default ({
  engineType,
  rootLayerId,
  isEditable,
  isBuilt,
  isPublished,
  layers,
  layerMap,
  selectedLayerId: outerSelectedLayerId,
  selectedBlockId: outerSelectedBlockId,
  camera,
  sceneProperty,
  onLayerSelect,
  onBlockSelect,
  onCameraChange,
}: {
  engineType?: string;
  rootLayerId?: string;
  isEditable?: boolean;
  isBuilt?: boolean;
  isPublished?: boolean;
  layers?: Layer[];
  layerMap?: Map<string, Layer>;
  selectedLayerId?: string;
  selectedBlockId?: string;
  camera?: Camera;
  sceneProperty?: SceneProperty;
  onLayerSelect?: (id?: string) => void;
  onBlockSelect?: (id?: string) => void;
  onCameraChange?: (c: Camera) => void;
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

  const {
    flattenLayers,
    selectedLayer,
    selectedLayerId,
    layerSelectionReason,
    layerOverridenInfobox,
    infobox,
    selectLayer,
    findLayerById,
    findLayerByIds,
  } = useLayers({
    layers,
    selected: outerSelectedLayerId,
    onSelect: onLayerSelect,
    layerMap,
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
  const updateCamera = useCallback(
    (camera: Camera) => {
      setInnerCamera(camera);
      onCameraChange?.(camera);
    },
    [onCameraChange],
  );

  const [, { add: hideLayer, remove: showLayer, has: isLayerHidden }] = useSet<string>();
  const showLayers = useCallback(
    (...ids: string[]) => {
      for (const id of ids) {
        showLayer(id);
      }
    },
    [showLayer],
  );
  const hideLayers = useCallback(
    (...ids: string[]) => {
      for (const id of ids) {
        hideLayer(id);
      }
    },
    [hideLayer],
  );

  const { enableGA, trackingId } = sceneProperty?.googleAnalytics || {};
  useEffect(() => {
    if (!isPublished || !enableGA || !trackingId) return;
    initialize(trackingId);
    pageview(window.location.pathname);
  }, [isPublished, enableGA, trackingId]);

  const visualizerContext = useMemo((): VisualizerContext => {
    return {
      engine: engineRef.current ?? undefined,
      camera,
      layers,
      selectedLayer,
      layerSelectionReason,
      layerOverridenInfobox,
      findLayerById,
      findLayerByIds,
      showLayer: showLayers,
      hideLayer: hideLayers,
      selectLayer,
    };
  }, [
    camera,
    layers,
    selectedLayer,
    layerSelectionReason,
    layerOverridenInfobox,
    findLayerById,
    findLayerByIds,
    showLayers,
    hideLayers,
    selectLayer,
  ]);

  useEffect(() => {
    const c = engineRef.current?.getCamera();
    if (c) {
      setInnerCamera(c);
    }
  }, [engineType]);

  const [commonReearth] = useCommonReearth({ ctx: visualizerContext, sceneProperty });
  useEffect(() => {
    // expose plugin API for developers
    window.reearth = commonReearth;
    return () => {
      delete window.reearth;
    };
  }, [commonReearth]);

  return {
    engineRef,
    wrapperRef,
    isDroppable,
    visualizerContext,
    selectedLayerId,
    selectedLayer,
    layerSelectionReason,
    selectedBlockId,
    innerCamera,
    infobox,
    flattenLayers,
    isLayerHidden,
    selectLayer,
    selectBlock,
    updateCamera,
  };
};

function useLayers({
  layers,
  selected: outerSelectedPrimitiveId,
  onSelect,
  layerMap,
}: {
  layers?: Layer[];
  selected?: string;
  onSelect?: (id?: string, options?: SelectLayerOptions) => void;
  layerMap?: Map<string, Layer>;
}) {
  const [selectedLayerId, innerSelectLayer] = useState<string | undefined>();
  const [layerSelectionReason, setSelectionReason] = useState<string | undefined>();
  const [layerOverridenInfobox, setPrimitiveOverridenInfobox] = useState<OverriddenInfobox>();

  const [getLayer, flattenLayers] = useGetLayer(layers, layerMap);
  const selectedLayer = useMemo(() => getLayer(selectedLayerId), [selectedLayerId, getLayer]);

  const selectLayer = useCallback(
    (id?: string, { reason, overriddenInfobox }: SelectLayerOptions = {}) => {
      innerSelectLayer(id);
      onSelect?.(id);
      setSelectionReason(reason);
      setPrimitiveOverridenInfobox(overriddenInfobox);
    },
    [onSelect],
  );

  const blocks = useMemo(
    (): Block[] | undefined => overridenInfoboxBlocks(layerOverridenInfobox),
    [layerOverridenInfobox],
  );

  const infobox = useMemo<
    | Pick<InfoboxProps, "infoboxKey" | "title" | "visible" | "layer" | "blocks" | "isEditable">
    | undefined
  >(
    () =>
      selectedLayer
        ? {
            infoboxKey: selectedLayer.id,
            title: layerOverridenInfobox?.title || selectedLayer.title,
            isEditable: !layerOverridenInfobox && selectedLayer.infoboxEditable,
            visible: !!selectedLayer?.infobox,
            layer: selectedLayer,
            blocks,
          }
        : undefined,
    [selectedLayer, layerOverridenInfobox, blocks],
  );

  const findLayerByIds = useCallback(
    (...ids: string[]): (Layer | undefined)[] => ids.map(id => getLayer(id)),
    [getLayer],
  );

  useEffect(() => {
    innerSelectLayer(outerSelectedPrimitiveId);
    setSelectionReason(undefined);
    setPrimitiveOverridenInfobox(undefined);
  }, [outerSelectedPrimitiveId]);

  return {
    flattenLayers,
    selectedLayer,
    selectedLayerId,
    layerSelectionReason,
    layerOverridenInfobox,
    infobox,
    selectLayer,
    findLayerById: getLayer,
    findLayerByIds,
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

function overridenInfoboxBlocks(
  overriddenInfobox: OverriddenInfobox | undefined,
): Block[] | undefined {
  return overriddenInfobox && Array.isArray(overriddenInfobox?.content)
    ? [
        {
          id: "content",
          pluginId: "reearth",
          extensionId: "dlblock",
          property: {
            items: overriddenInfobox.content.map((c, i) => ({
              id: i,
              item_title: c.key,
              item_datastr: String(c.value),
              item_datatype: "string",
            })),
          },
        },
      ]
    : undefined;
}

function useGetLayer(
  layers: Layer[] = [],
  map?: Map<string, Layer>,
): [(id: string | undefined) => Layer | undefined, Layer[]] {
  const flayers = useMemo(() => flattenLayers(layers), [layers]);
  const m = useMemo(() => {
    return map ?? new Map<string, Layer>(flayers.map(l => [l.id, l]));
  }, [map, flayers]);
  const get = useCallback(
    (id: string | undefined): Layer | undefined => (id ? m.get(id) : undefined),
    [m],
  );
  return [get, flayers];
}

function flattenLayers(layers: Layer[] | undefined): Layer[] {
  return (
    layers?.reduce<Layer[]>((a, b) => [...a, ...(b.isVisible ? b.children ?? [b] : [])], []) ?? []
  );
}
