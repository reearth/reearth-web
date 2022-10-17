import { Rectangle, Cartographic, Math as CesiumMath } from "cesium";
import { useRef, useEffect, useMemo, useState, useCallback, RefObject } from "react";
import { initialize, pageview } from "react-ga";

import { useDrop, DropOptions } from "@reearth/util/use-dnd";
import { Camera, LatLng, ValueTypes, ValueType } from "@reearth/util/value";

import type {
  OverriddenInfobox,
  Ref as EngineRef,
  SceneProperty,
  SelectLayerOptions,
} from "./Engine";
import type { MouseEventHandles } from "./Engine/ref";
import type { Props as InfoboxProps, Block } from "./Infobox";
import { Layer, LayersRef } from "./next";
import type { ProviderProps } from "./Plugin";
import type {
  CameraOptions,
  Clock,
  FlyToDestination,
  LookAtDestination,
  Tag,
} from "./Plugin/types";
import { useOverriddenProperty } from "./utils";

export default ({
  engineType,
  rootLayerId,
  isEditable,
  isBuilt,
  isPublished,
  selectedLayerId: outerSelectedLayerId,
  selectedBlockId: outerSelectedBlockId,
  zoomedLayerId,
  camera,
  clock,
  sceneProperty,
  tags,
  onLayerSelect,
  onBlockSelect,
  onBlockChange,
  onCameraChange,
  onTick,
  onLayerDrop,
}: {
  engineType?: string;
  rootLayerId?: string;
  isEditable?: boolean;
  isBuilt?: boolean;
  isPublished?: boolean;
  selectedLayerId?: string;
  selectedBlockId?: string;
  zoomedLayerId?: string;
  camera?: Camera;
  clock?: Clock;
  sceneProperty?: SceneProperty;
  tags?: Tag[];
  onLayerSelect?: (id?: string) => void;
  onBlockSelect?: (id?: string) => void;
  onBlockChange?: <T extends keyof ValueTypes>(
    blockId: string,
    schemaGroupId: string,
    fid: string,
    v: ValueTypes[T],
    vt: T,
    selectedLayer?: Layer,
  ) => void;
  onCameraChange?: (c: Camera) => void;
  onTick?: (c: Clock) => void;
  onLayerDrop?: (layer: Layer, key: string, latlng: LatLng) => void;
}) => {
  const engineRef = useRef<EngineRef>(null);
  const [overriddenSceneProperty, overrideSceneProperty] = useOverriddenProperty(sceneProperty);

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
    layerOverriddenProperties,
    layerSelectionReason,
    layerOverridenInfobox,
    infobox,
    layersRef,
    selectLayer,
    overrideLayerProperty,
  } = useLayers({
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

  const changeBlock = useCallback(
    <T extends ValueType>(
      blockId: string,
      schemaItemId: string,
      fieldId: string,
      value: ValueTypes[T],
      type: T,
    ) => {
      onBlockChange?.(blockId, schemaItemId, fieldId, value, type, selectedLayer);
    },
    [onBlockChange, selectedLayer],
  );

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

  // clock
  const [innerClock, setInnerClock] = useState(clock);
  useEffect(() => {
    setInnerClock(clock);
  }, [clock]);

  const updateClock = useCallback(
    (clock: Clock) => {
      setInnerClock(clock);
      onTick?.(clock);
    },
    [onTick],
  );

  // dnd
  const handleLayerDrop = useCallback(
    (id: string, key: string, latlng: LatLng | undefined) => {
      if (!layersRef.current) return;
      const layer = layersRef.current.findById(id);
      if (latlng && layer) onLayerDrop?.(layer, key, latlng);
    },
    [layersRef, onLayerDrop],
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
      sceneProperty: overriddenSceneProperty,
      tags,
      camera: innerCamera,
      clock: innerClock,
      selectedLayer,
      layerSelectionReason,
      layerOverridenInfobox,
      layerOverriddenProperties,
      selectLayer,
      overrideLayerProperty,
      overrideSceneProperty,
    },
    engineRef,
    layersRef,
  );

  useEffect(() => {
    engineRef.current?.requestRender();
  });

  const handleInfoboxMaskClick = useCallback(() => {
    selectLayer(undefined);
  }, [selectLayer]);

  useEffect(() => {
    if (zoomedLayerId) {
      engineRef.current?.lookAtLayer(zoomedLayerId);
    }
  }, [zoomedLayerId]);

  return {
    engineRef,
    wrapperRef,
    layersRef,
    isDroppable,
    providerProps,
    selectedLayer,
    layerSelectionReason,
    layerOverriddenProperties,
    selectedBlockId,
    innerCamera,
    innerClock,
    infobox,
    overriddenSceneProperty,
    selectLayer,
    selectBlock,
    changeBlock,
    updateCamera,
    updateClock,
    handleLayerDrop,
    handleInfoboxMaskClick,
  };
};

function useLayers({
  selected: outerSelectedLayerId,
  onSelect,
}: {
  selected?: string;
  onSelect?: (id?: string, options?: SelectLayerOptions) => void;
}) {
  const layersRef = useRef<LayersRef>(null);
  const [layerSelectionReason, setSelectionReason] = useState<string | undefined>();
  const [layerOverridenInfobox, setPrimitiveOverridenInfobox] = useState<OverriddenInfobox>();
  const [selectedLayer, setSelectedLayer] = useState<Layer>();

  const selectLayer = useCallback(
    (id?: string, { reason, overriddenInfobox }: SelectLayerOptions = {}) => {
      if (!layersRef.current) return;

      const selected = id ? layersRef.current.findById(id) : undefined;
      setSelectedLayer(selected);
      onSelect?.(id && !!selected ? id : undefined);
      setSelectionReason(reason);
      setPrimitiveOverridenInfobox(overriddenInfobox);
    },
    [onSelect, layersRef],
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

  useEffect(() => {
    setSelectionReason(undefined);
    setPrimitiveOverridenInfobox(undefined);
  }, [outerSelectedLayerId]);

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
    layersRef,
    selectedLayer,
    layerSelectionReason,
    layerOverridenInfobox,
    layerOverriddenProperties,
    infobox,
    selectLayer,
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
    | "engine"
    | "flyTo"
    | "lookAt"
    | "zoomIn"
    | "zoomOut"
    | "orbit"
    | "rotateRight"
    | "layers"
    | "layersInViewport"
    | "viewport"
    | "onMouseEvent"
    | "captureScreen"
    | "enableScreenSpaceCameraController"
    | "lookHorizontal"
    | "lookVertical"
    | "moveForward"
    | "moveBackward"
    | "moveUp"
    | "moveDown"
    | "moveLeft"
    | "moveRight"
    | "moveOverTerrain"
    | "flyToGround"
  >,
  engineRef: RefObject<EngineRef>,
  layersRef: RefObject<LayersRef>,
): ProviderProps {
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

  const viewport = useCallback(() => {
    return engineRef.current?.getViewport();
  }, [engineRef]);

  const layersInViewport = useCallback(() => {
    const rect = engineRef.current?.getViewport();
    return (
      layersRef.current?.findAll(
        layer =>
          rect &&
          layer.property?.default?.location &&
          typeof layer.property.default.location.lng === "number" &&
          typeof layer.property.default.location.lat === "number" &&
          Rectangle.contains(
            new Rectangle(
              CesiumMath.toRadians(rect.west),
              CesiumMath.toRadians(rect.south),
              CesiumMath.toRadians(rect.east),
              CesiumMath.toRadians(rect.north),
            ),
            Cartographic.fromDegrees(
              layer.property.default.location.lng,
              layer.property.default.location.lat,
            ),
          ),
      ) ?? []
    );
  }, [engineRef, layersRef]);

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

  const rotateRight = useCallback(
    (radian: number) => {
      engineRef.current?.rotateRight(radian);
    },
    [engineRef],
  );

  const orbit = useCallback(
    (radian: number) => {
      engineRef.current?.orbit(radian);
    },
    [engineRef],
  );

  const onMouseEvent = useCallback(
    (eventType: keyof MouseEventHandles, fn: any) => {
      engineRef.current?.[eventType]?.(fn);
    },
    [engineRef],
  );

  const captureScreen = useCallback(
    (type?: string, encoderOptions?: number) => {
      return engineRef.current?.captureScreen(type, encoderOptions);
    },
    [engineRef],
  );

  const enableScreenSpaceCameraController = useCallback(
    (enabled: boolean) => engineRef?.current?.enableScreenSpaceCameraController(enabled),
    [engineRef],
  );

  const lookHorizontal = useCallback(
    (amount: number) => {
      engineRef.current?.lookHorizontal(amount);
    },
    [engineRef],
  );

  const lookVertical = useCallback(
    (amount: number) => {
      engineRef.current?.lookVertical(amount);
    },
    [engineRef],
  );

  const moveForward = useCallback(
    (amount: number) => {
      engineRef.current?.moveForward(amount);
    },
    [engineRef],
  );

  const moveBackward = useCallback(
    (amount: number) => {
      engineRef.current?.moveBackward(amount);
    },
    [engineRef],
  );

  const moveUp = useCallback(
    (amount: number) => {
      engineRef.current?.moveUp(amount);
    },
    [engineRef],
  );

  const moveDown = useCallback(
    (amount: number) => {
      engineRef.current?.moveDown(amount);
    },
    [engineRef],
  );

  const moveLeft = useCallback(
    (amount: number) => {
      engineRef.current?.moveLeft(amount);
    },
    [engineRef],
  );

  const moveRight = useCallback(
    (amount: number) => {
      engineRef.current?.moveRight(amount);
    },
    [engineRef],
  );

  const moveOverTerrain = useCallback(
    (offset?: number) => {
      return engineRef.current?.moveOverTerrain(offset);
    },
    [engineRef],
  );

  const flyToGround = useCallback(
    (dest: FlyToDestination, options?: CameraOptions, offset?: number) => {
      engineRef.current?.flyToGround(dest, options, offset);
    },
    [engineRef],
  );

  return {
    ...props,
    layersRef,
    flyTo,
    lookAt,
    zoomIn,
    zoomOut,
    orbit,
    rotateRight,
    layersInViewport,
    viewport,
    onMouseEvent,
    captureScreen,
    enableScreenSpaceCameraController,
    lookHorizontal,
    lookVertical,
    moveForward,
    moveBackward,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    moveOverTerrain,
    flyToGround,
  };
}
