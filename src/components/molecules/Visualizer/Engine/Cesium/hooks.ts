import { Color, Entity, Ion, Cesium3DTileFeature, Cartesian3, Cartographic, Camera as CesiumCamera, Math, EllipsoidGeodesic, Ellipsoid, Rectangle, BoundingRectangle } from "cesium";
import type { Viewer as CesiumViewer, ImageryProvider, TerrainProvider } from "cesium";
import CesiumDnD, { Context } from "cesium-dnd";
import { isEqual, throttle } from "lodash-es";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDeepCompareEffect } from "react-use";
import type { CesiumComponentRef, CesiumMovementEvent, RootEventTarget } from "resium";
import { useCustomCompareCallback } from "use-custom-compare";

import { Camera, LatLng } from "@reearth/util/value";

import type { SelectLayerOptions, Ref as EngineRef, SceneProperty } from "..";

import { getCamera, isDraggable, isSelectable, layerIdField } from "./common";
import imagery from "./imagery";
import terrain from "./terrain";
import useEngineRef from "./useEngineRef";
import { convertCartesian3ToPosition } from "./utils";
import { he } from "date-fns/locale";

export default ({
  ref,
  property,
  camera,
  selectedLayerId,
  onLayerSelect,
  onCameraChange,
  isLayerDraggable,
  onLayerDrag,
  onLayerDrop,
}: {
  ref: React.ForwardedRef<EngineRef>;
  property?: SceneProperty;
  camera?: Camera;
  selectedLayerId?: string;
  onLayerSelect?: (id?: string, options?: SelectLayerOptions) => void;
  onCameraChange?: (camera: Camera) => void;
  isLayerDraggable?: boolean;
  onLayerDrag?: (layerId: string, position: LatLng) => void;
  onLayerDrop?: (layerId: string, propertyKey: string, position: LatLng | undefined) => void;
}) => {
  const cesium = useRef<CesiumComponentRef<CesiumViewer>>(null);

  // Ensure to set Cesium Ion access token before the first rendering
  useLayoutEffect(() => {
    const { ion } = property?.default ?? {};
    if (ion) {
      Ion.defaultAccessToken = ion;
    }
  }, [property?.default]);

  // expose ref
  const engineAPI = useEngineRef(ref, cesium);

  // imagery layers
  const [imageryLayers, setImageryLayers] =
    useState<[string, ImageryProvider, number | undefined, number | undefined][]>();

  useDeepCompareEffect(() => {
    const newTiles = (property?.tiles?.length ? property.tiles : undefined)
      ?.map(
        t =>
          [t.id, t.tile_type || "default", t.tile_url, t.tile_minLevel, t.tile_maxLevel] as const,
      )
      .map<[string, ImageryProvider | null, number | undefined, number | undefined]>(
        ([id, type, url, min, max]) => [
          id,
          type ? (url ? imagery[type](url) : imagery[type]()) : null,
          min,
          max,
        ],
      )
      .filter(
        (t): t is [string, ImageryProvider, number | undefined, number | undefined] => !!t[1],
      );
    setImageryLayers(newTiles);
  }, [property?.tiles ?? []]);

  // terrain
  const terrainProperty = useMemo(
    () => ({
      terrain: property?.terrain?.terrain || property?.default?.terrain,
      terrainType: property?.terrain?.terrainType || property?.default?.terrainType,
      terrainExaggeration:
        property?.terrain?.terrainExaggeration || property?.default?.terrainExaggeration,
      terrainExaggerationRelativeHeight:
        property?.terrain?.terrainExaggerationRelativeHeight ||
        property?.default?.terrainExaggerationRelativeHeight,
      depthTestAgainstTerrain:
        property?.terrain?.depthTestAgainstTerrain || property?.default?.depthTestAgainstTerrain,
    }),
    [
      property?.default?.terrain,
      property?.default?.terrainType,
      property?.default?.terrainExaggeration,
      property?.default?.terrainExaggerationRelativeHeight,
      property?.default?.depthTestAgainstTerrain,
      property?.terrain?.terrain,
      property?.terrain?.terrainType,
      property?.terrain?.terrainExaggeration,
      property?.terrain?.terrainExaggerationRelativeHeight,
      property?.terrain?.depthTestAgainstTerrain,
    ],
  );

  const terrainProvider = useMemo((): TerrainProvider | undefined => {
    return terrainProperty.terrain
      ? terrainProperty.terrainType
        ? terrain[terrainProperty.terrainType] || terrain.default
        : terrain.cesium
      : terrain.default;
  }, [terrainProperty.terrain, terrainProperty.terrainType]);

  const backgroundColor = useMemo(
    () =>
      property?.default?.bgcolor ? Color.fromCssColorString(property.default.bgcolor) : undefined,
    [property?.default?.bgcolor],
  );

  // move to initial position at startup
  const initialCameraFlight = useRef(false);

  const handleMount = useCustomCompareCallback(
    () => {
      if (initialCameraFlight.current) return;
      initialCameraFlight.current = true;
      if (property?.default?.camera) {
        engineAPI.flyTo(property.default.camera, { duration: 0 });
      }
      const camera = getCamera(cesium?.current?.cesiumElement);
      if (camera) {
        onCameraChange?.(camera);
      }
    },
    [engineAPI, onCameraChange, property?.default?.camera],
    (prevDeps, nextDeps) =>
      prevDeps[0] === nextDeps[0] &&
      prevDeps[1] === nextDeps[1] &&
      isEqual(prevDeps[2], nextDeps[2]),
  );

  const handleUnmount = useCallback(() => {
    initialCameraFlight.current = false;
  }, []);

  const throttledCameraChange = useMemo(
    () =>
      throttle((c: Camera) => {
        onCameraChange?.(c);
      }, 100),
    [onCameraChange],
  );

  // call onCameraChange event after moving camera
  const emittedCamera = useRef<Camera>();
  const handleCameraMoveEnd = useCallback(() => {
    const viewer = cesium?.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed() || !onCameraChange) return;

    const c = getCamera(viewer);
    if (c && !isEqual(c, camera)) {
      emittedCamera.current = c;
      throttledCameraChange(c);
    }
  }, [throttledCameraChange, camera]);

  // camera
  useEffect(() => {
    if (camera && (!emittedCamera.current || emittedCamera.current !== camera)) {
      engineAPI.flyTo(camera, { duration: 0 });
      emittedCamera.current = undefined;
    }
  }, [camera, engineAPI]);

  const geodsic = useMemo((): undefined | { geodesicVertical: EllipsoidGeodesic; geodesicHorizontal: EllipsoidGeodesic } => {
    const viewer = cesium.current?.cesiumElement;
    if (
      !viewer ||
      viewer.isDestroyed() ||
      !property?.cameraLimiter ||
      !property?.cameraLimiter.target_area
    )
      return undefined;
    const ellipsoid = viewer.scene.globe.ellipsoid;

    const centerPoint = Cartesian3.fromDegrees(property.cameraLimiter.target_area.lng, property.cameraLimiter.target_area.lat, 0);


    const CartographicCenterPoint = Cartographic.fromCartesian(centerPoint);
    const normal = Ellipsoid.WGS84.geodeticSurfaceNormal(centerPoint);
    const east = Cartesian3.normalize(Cartesian3.cross(Cartesian3.UNIT_Z, normal, new Cartesian3()), new Cartesian3());
    const north = Cartesian3.normalize(Cartesian3.cross(normal, east, new Cartesian3()), new Cartesian3());

    const geodesicVertical = new EllipsoidGeodesic(CartographicCenterPoint, Cartographic.fromCartesian(north), ellipsoid);
    const geodesicHorizontal = new EllipsoidGeodesic(CartographicCenterPoint, Cartographic.fromCartesian(east), ellipsoid);
    return { geodesicVertical, geodesicHorizontal }
  }, [property?.cameraLimiter?.target_area])

  //manage camera limiter
  const limiterDimensions = useMemo((): undefined | {
    cartographicDimensions: {
      rightDemention: Cartographic;
      leftDemention: Cartographic;
      topDemention: Cartographic;
      bottomDemention: Cartographic;
    }
    cartesianArray: Cartesian3[],
    cartesianDimensions: {
      rightTop: Cartesian3;
      leftTop: Cartesian3;
      leftBottom: Cartesian3;
      rightBottom: Cartesian3;
    }
  } => {
    const viewer = cesium.current?.cesiumElement;
    if (
      !viewer ||
      viewer.isDestroyed() ||
      !property?.cameraLimiter ||
      !property?.cameraLimiter.target_area ||
      !geodsic
    )
      return undefined;

    const topDemention = geodsic.geodesicVertical.interpolateUsingSurfaceDistance(property.cameraLimiter.target_height / 2);
    const bottomDemention = geodsic.geodesicVertical.interpolateUsingSurfaceDistance(-property.cameraLimiter.target_height / 2);

    const rightDemention = geodsic.geodesicHorizontal.interpolateUsingSurfaceDistance(property.cameraLimiter.target_width / 2);
    const leftDemention = geodsic.geodesicHorizontal.interpolateUsingSurfaceDistance(-property.cameraLimiter.target_width / 2);

    const rightTop = new Cartographic(rightDemention.longitude, topDemention.latitude, 0);
    const leftTop = new Cartographic(leftDemention.longitude, topDemention.latitude, 0);
    const rightBottom = new Cartographic(rightDemention.longitude, bottomDemention.latitude, 0);
    const leftBottom = new Cartographic(leftDemention.longitude, bottomDemention.latitude, 0);



    return {
      cartographicDimensions: {
        rightDemention,
        leftDemention,
        topDemention,
        bottomDemention
      },
      cartesianArray: [
        Cartographic.toCartesian(rightTop),
        Cartographic.toCartesian(leftTop),
        Cartographic.toCartesian(leftBottom),
        Cartographic.toCartesian(rightBottom),
        Cartographic.toCartesian(rightTop)
      ],
      cartesianDimensions: {
        rightTop: Cartographic.toCartesian(rightTop),
        leftTop: Cartographic.toCartesian(leftTop),
        leftBottom: Cartographic.toCartesian(leftBottom),
        rightBottom: Cartographic.toCartesian(rightBottom)
      }
    };
  }, [property?.cameraLimiter, geodsic]);

  const cameraViewOuterBoundaries = useMemo((): undefined | { cartesianArray: Cartesian3[] } => {
    const viewer = cesium.current?.cesiumElement;
    if (
      !viewer ||
      viewer.isDestroyed() ||
      !property?.cameraLimiter ||
      !property?.cameraLimiter.target_area ||
      !geodsic
    )
      return undefined;


    // CAMERA
    const camera = new CesiumCamera(viewer.scene);
    camera.setView({
      destination: Cartesian3.fromDegrees(property.cameraLimiter.target_area.lng, property.cameraLimiter.target_area.lat, property.cameraLimiter.target_area.height),
      orientation: {
        heading: property?.cameraLimiter?.target_area.heading,
        pitch: property?.cameraLimiter?.target_area.pitch,
        roll: property?.cameraLimiter?.target_area.roll,
        up: camera.up,
      },
    });

    const computedViewRectangle = camera.computeViewRectangle() as Rectangle;
    const rectangleHalfWidth = Rectangle.computeWidth(computedViewRectangle) * Math.PI * 1000000;
    const rectangleHalfHeight = Rectangle.computeHeight(computedViewRectangle) * Math.PI * 1000000;

    const recTopDemention = geodsic.geodesicVertical.interpolateUsingSurfaceDistance(property.cameraLimiter.target_height / 2 + rectangleHalfHeight);
    const recBottomDemention = geodsic.geodesicVertical.interpolateUsingSurfaceDistance(-(property.cameraLimiter.target_height / 2 + rectangleHalfHeight));
    const recRightDemention = geodsic.geodesicHorizontal.interpolateUsingSurfaceDistance(property.cameraLimiter.target_width / 2 + rectangleHalfWidth);
    const recLeftDemention = geodsic.geodesicHorizontal.interpolateUsingSurfaceDistance(-(property.cameraLimiter.target_width / 2 + rectangleHalfWidth));

    const recRightTop = new Cartographic(recRightDemention.longitude, recTopDemention.latitude, 0);
    const recLeftTop = new Cartographic(recLeftDemention.longitude, recTopDemention.latitude, 0);
    const recRightBottom = new Cartographic(recRightDemention.longitude, recBottomDemention.latitude, 0);
    const recLeftBottom = new Cartographic(recLeftDemention.longitude, recBottomDemention.latitude, 0);
    // END CAMERA

    return {
      cartesianArray: [
        Cartographic.toCartesian(recRightTop),
        Cartographic.toCartesian(recLeftTop),
        Cartographic.toCartesian(recLeftBottom),
        Cartographic.toCartesian(recRightBottom),
        Cartographic.toCartesian(recRightTop)
      ],
    };
  }, [geodsic])

  useEffect(() => {
    const camera = getCamera(cesium?.current?.cesiumElement);
    const viewer = cesium?.current?.cesiumElement;
    if (
      !viewer ||
      viewer.isDestroyed() ||
      !onCameraChange ||
      !property?.cameraLimiter?.enable_camera_limiter ||
      !limiterDimensions
    )
      return;
    if (camera) {
      const cameraPosition = Cartographic.fromDegrees(camera?.lng, camera?.lat, camera?.height);

      const destination = new Cartographic(
        Math.clamp(
          cameraPosition.longitude,
          limiterDimensions.cartographicDimensions.leftDemention.longitude,
          limiterDimensions.cartographicDimensions.rightDemention.longitude,
        ),
        Math.clamp(
          cameraPosition.latitude,
          limiterDimensions.cartographicDimensions.bottomDemention.latitude,
          limiterDimensions.cartographicDimensions.topDemention.latitude,
        ),
        cameraPosition.height,
      );

      viewer.camera.setView({
        destination: Cartographic.toCartesian(destination),
        orientation: {
          heading: viewer.camera.heading,
          pitch: viewer.camera.pitch,
          roll: viewer.camera.roll,
          up: viewer.camera.up,
        },
      });
    }
  }, [camera, onCameraChange, engineAPI, property?.cameraLimiter, limiterDimensions]);


  // manage layer selection
  useEffect(() => {
    const viewer = cesium.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return;

    const entity = selectedLayerId ? viewer.entities.getById(selectedLayerId) : undefined;
    if (viewer.selectedEntity === entity || (entity && !isSelectable(entity))) return;

    viewer.selectedEntity = entity;
  }, [cesium, selectedLayerId]);

  const handleClick = useCallback(
    (_: CesiumMovementEvent, target: RootEventTarget) => {
      const viewer = cesium.current?.cesiumElement;
      if (!viewer || viewer.isDestroyed()) return;

      if (target && "id" in target && target.id instanceof Entity && isSelectable(target.id)) {
        onLayerSelect?.(target.id.id);
        return;
      }

      if (target && target instanceof Cesium3DTileFeature) {
        const layerId: string | undefined = (target.primitive as any)?.[layerIdField];
        if (layerId) {
          onLayerSelect?.(layerId, {
            overriddenInfobox: {
              title: target.getProperty("name"),
              content: tileProperties(target),
            },
          });
        }
        return;
      }

      onLayerSelect?.();
    },
    [onLayerSelect],
  );

  // E2E test
  useEffect(() => {
    if (window.REEARTH_E2E_ACCESS_TOKEN) {
      window.REEARTH_E2E_CESIUM_VIEWER = cesium.current?.cesiumElement;
      return () => {
        delete window.REEARTH_E2E_CESIUM_VIEWER;
      };
    }
    return;
  }, [cesium.current?.cesiumElement]);

  // update
  useEffect(() => {
    const viewer = cesium.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return;
    viewer.scene.requestRender();
  });

  // enable Drag and Drop Layers
  const handleLayerDrag = useCallback(
    (e: Entity, position: Cartesian3 | undefined, _context: Context): boolean | void => {
      const viewer = cesium.current?.cesiumElement;
      if (!viewer || viewer.isDestroyed() || !isSelectable(e) || !isDraggable(e)) return false;

      const pos = convertCartesian3ToPosition(cesium.current?.cesiumElement, position);
      if (!pos) return false;

      onLayerDrag?.(e.id, pos);
    },
    [onLayerDrag],
  );

  const handleLayerDrop = useCallback(
    (e: Entity, position: Cartesian3 | undefined): boolean | void => {
      const viewer = cesium.current?.cesiumElement;
      if (!viewer || viewer.isDestroyed()) return false;

      const key = isDraggable(e);
      const pos = convertCartesian3ToPosition(cesium.current?.cesiumElement, position);
      onLayerDrop?.(e.id, key || "", pos);

      return false; // let apollo-client handle optimistic updates
    },
    [onLayerDrop],
  );

  const cesiumDnD = useRef<CesiumDnD>();
  useEffect(() => {
    const viewer = cesium.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return;
    cesiumDnD.current = new CesiumDnD(viewer, {
      onDrag: handleLayerDrag,
      onDrop: handleLayerDrop,
      dragDelay: 1000,
      initialDisabled: !isLayerDraggable,
    });
    return () => {
      if (!viewer || viewer.isDestroyed()) return;
      cesiumDnD.current?.disable();
    };
  }, [handleLayerDrag, handleLayerDrop, isLayerDraggable]);

  return {
    terrainProvider,
    terrainProperty,
    backgroundColor,
    imageryLayers,
    cesium,
    limiterDimensions,
    cameraViewOuterBoundaries,
    handleMount,
    handleUnmount,
    handleClick,
    handleCameraMoveEnd,
  };
};

function tileProperties(t: Cesium3DTileFeature): { key: string; value: any }[] {
  return t
    .getPropertyNames()
    .reduce<{ key: string; value: any }[]>(
      (a, b) => [...a, { key: b, value: t.getProperty(b) }],
      [],
    );
}
