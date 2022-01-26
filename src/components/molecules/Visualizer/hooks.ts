import { Rectangle, Cartographic } from "cesium";
import { useRef, useEffect, useMemo, useState, useCallback, RefObject } from "react";
import { initialize, pageview } from "react-ga";
import { useSet } from "react-use";

import { useDrop, DropOptions } from "@reearth/util/use-dnd";
import { Camera, LatLng } from "@reearth/util/value";

import type {
  OverriddenInfobox,
  Ref as EngineRef,
  SceneProperty,
  SelectLayerOptions,
} from "./Engine";
import type { Props as InfoboxProps, Block } from "./Infobox";
import { LayerStore, emptyLayerStore } from "./Layers";
import type { ProviderProps } from "./Plugin";
import type { CameraOptions, FlyToDestination, LookAtDestination, Tag } from "./Plugin/types";

export default ({
  engineType,
  rootLayerId,
  isEditable,
  isBuilt,
  isPublished,
  layers = emptyLayerStore,
  selectedLayerId: outerSelectedLayerId,
  selectedBlockId: outerSelectedBlockId,
  camera,
  sceneProperty,
  tags,
  onLayerSelect,
  onBlockSelect,
  onCameraChange,
  onLayerDrop,
}: {
  engineType?: string;
  rootLayerId?: string;
  isEditable?: boolean;
  isBuilt?: boolean;
  isPublished?: boolean;
  layers?: LayerStore;
  selectedLayerId?: string;
  selectedBlockId?: string;
  camera?: Camera;
  sceneProperty?: SceneProperty;
  tags?: Tag[];
  onLayerSelect?: (id?: string) => void;
  onBlockSelect?: (id?: string) => void;
  onCameraChange?: (c: Camera) => void;
  onLayerDrop?: (id: string, key: string, latlng: LatLng) => void;
}) => {
  const engineRef = useRef<EngineRef>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const { ref: dropRef, isDroppable } = useDrop(
    useMemo(
      (): DropOptions => ({
        accept: ["primitive"],
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
    selectedLayer,
    selectedLayerId,
    layerOverriddenProperties,
    layerSelectionReason,
    layerOverridenInfobox,
    infobox,
    selectLayer,
    hideLayers,
    isLayerHidden,
    showLayers,
    overrideLayerProperty,
  } = useLayers({
    layers,
    selected: outerSelectedLayerId,
    onSelect: onLayerSelect,
  });

  // selected block
  const [selectedBlockId, selectBlock] = useInnerState<string>(outerSelectedBlockId, onBlockSelect);

  useEffect(() => {
    if (!isEditable || !isBuilt) {
      selectBlock();
    }
  }, [isEditable, isBuilt, selectBlock]);

  // camera
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

  // dnd
  const [isLayerDragging, setIsLayerDragging] = useState(false);
  const handleLayerDrag = useCallback(() => {
    setIsLayerDragging(true);
  }, []);
  const handleLayerDrop = useCallback(
    (id: string, key: string, latlng: LatLng | undefined) => {
      setIsLayerDragging(false);
      if (latlng) onLayerDrop?.(id, key, latlng);
    },
    [onLayerDrop],
  );

  // GA
  const { enableGA, trackingId } = sceneProperty?.googleAnalytics || {};

  useEffect(() => {
    if (!isPublished || !enableGA || !trackingId) return;
    initialize(trackingId);
    pageview(window.location.pathname);
  }, [isPublished, enableGA, trackingId]);

  const providerProps: ProviderProps = useProviderProps(
    {
      engineName: engineType || "",
      sceneProperty,
      tags,
      camera,
      selectedLayer,
      layerSelectionReason,
      layerOverridenInfobox,
      layerOverriddenProperties,
      showLayer: showLayers,
      hideLayer: hideLayers,
      selectLayer,
      overrideLayerProperty,
    },
    engineRef,
    layers,
  );

  useEffect(() => {
    engineRef.current?.requestRender();
  });

  return {
    engineRef,
    wrapperRef,
    isDroppable,
    providerProps,
    selectedLayerId,
    selectedLayer,
    layerSelectionReason,
    layerOverriddenProperties,
    selectedBlockId,
    innerCamera,
    infobox,
    isLayerHidden,
    selectLayer,
    selectBlock,
    updateCamera,
    isLayerDragging,
    handleLayerDrag,
    handleLayerDrop,
  };
};

function useLayers({
  layers,
  selected: outerSelectedPrimitiveId,
  onSelect,
}: {
  layers: LayerStore;
  selected?: string;
  onSelect?: (id?: string, options?: SelectLayerOptions) => void;
}) {
  const [selectedLayerId, innerSelectLayer] = useState<string | undefined>();
  const [layerSelectionReason, setSelectionReason] = useState<string | undefined>();
  const [layerOverridenInfobox, setPrimitiveOverridenInfobox] = useState<OverriddenInfobox>();

  const selectedLayer = useMemo(
    () => (selectedLayerId ? layers.findById(selectedLayerId) : undefined),
    [selectedLayerId, layers],
  );

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
            isEditable: !layerOverridenInfobox && !!selectedLayer.infobox,
            visible: !!selectedLayer?.infobox,
            layer: selectedLayer,
            blocks,
          }
        : undefined,
    [selectedLayer, layerOverridenInfobox, blocks],
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

  useEffect(() => {
    innerSelectLayer(outerSelectedPrimitiveId);
    setSelectionReason(undefined);
    setPrimitiveOverridenInfobox(undefined);
  }, [outerSelectedPrimitiveId]);

  const [layerOverriddenProperties, setLayeroverriddenProperties] = useState<{
    [id in string]: any;
  }>({});
  const overrideLayerProperty = useCallback((id: string, property: any) => {
    if (!id) return;
    if (typeof property !== "object") {
      setLayeroverriddenProperties(p => {
        delete p[id];
        return { ...p };
      });
      return;
    }
    setLayeroverriddenProperties(p => ({
      ...p,
      [id]: property,
    }));
  }, []);

  return {
    selectedLayer,
    selectedLayerId,
    layerSelectionReason,
    layerOverridenInfobox,
    layerOverriddenProperties,
    infobox,
    isLayerHidden,
    selectLayer,
    showLayers,
    hideLayers,
    overrideLayerProperty,
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

function useProviderProps(
  props: Omit<
    ProviderProps,
    "engine" | "flyTo" | "lookAt" | "zoomIn" | "zoomOut" | "layers" | "getLayersInViewport"
  >,
  engineRef: RefObject<EngineRef>,
  layers: LayerStore,
): ProviderProps {
  const isMarshalable = useCallback(
    (obj: any): boolean | "json" => {
      const im = engineRef.current?.isMarshalable ?? false;
      return typeof im === "function" ? im(obj) : im;
    },
    [engineRef],
  );

  const engine = useMemo(
    () => ({
      get api() {
        return engineRef.current?.pluginApi;
      },
      isMarshalable,
      get builtinPrimitives() {
        return engineRef.current?.builtinPrimitives;
      },
    }),
    [engineRef, isMarshalable],
  );

  const flyTo = useCallback(
    (dest: FlyToDestination, options?: CameraOptions) => {
      engineRef.current?.flyTo(dest, options);
    },
    [engineRef],
  );

  const lookAt = useCallback(
    (dest: LookAtDestination, options?: CameraOptions) => {
      engineRef.current?.lookAt(dest, options);
    },
    [engineRef],
  );

  const getLayersInViewport = useCallback(() => {
    const rect = engineRef.current?.getViewport();
    return layers.findAll(
      layer =>
        rect &&
        layer.property &&
        Rectangle.contains(
          rect,
          Cartographic.fromDegrees(
            layer.property.default.location.lng,
            layer.property.default.location.lat,
          ),
        ),
    );
  }, [engineRef, layers]);

  const zoomIn = useCallback(
    (amount: number) => {
      engineRef.current?.zoomIn(amount);
    },
    [engineRef],
  );

  const zoomOut = useCallback(
    (amount: number) => {
      engineRef.current?.zoomOut(amount);
    },
    [engineRef],
  );

  return {
    ...props,
    engine,
    flyTo,
    lookAt,
    zoomIn,
    zoomOut,
    layers,
    getLayersInViewport,
  };
}
