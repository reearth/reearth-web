import {
  Cartesian3,
  Cartesian2,
  HeadingPitchRoll,
  Quaternion,
  TranslationRotationScale,
  Cartographic,
  Math as CesiumMath,
} from "cesium";
import React, { useMemo, useEffect, memo, useState, useCallback, useRef } from "react";
import { useCesium } from "resium";

import { LatLngHeight, toColor } from "@reearth/util/value";

import { useContext } from "../../../Plugin";
import type { Props as PrimitiveProps } from "../../../Primitive";
import { sampleTerrainHeight } from "../common";

import { BOX_EDGES, SCALE_POINTS, SIDE_PLANES, SIDE_PLANE_NAMES } from "./constants";
import { Edge, EdgeEventCallback } from "./Edge";
import { PointEventCallback, ScalePoints } from "./ScalePoints";
import { Side } from "./Side";
import { computeMouseMoveAmount, updateTrs } from "./utils";

export type Props = PrimitiveProps<Property>;

export type Property = {
  default?: {
    location?: LatLngHeight;
    height?: number;
    width?: number;
    length?: number;
    heading?: number;
    pitch?: number;
    roll?: number;
    fillColor?: string;
    outlineColor?: string;
    activeOutlineColor?: string;
    outlineWidth?: number;
    draggableOutlineColor?: string;
    activeDraggableOutlineColor?: string;
    draggableOutlineWidth?: number;
    scalePoint?: boolean;
    axisLine?: boolean;
    pointFillColor?: string;
    pointOutlineColor?: string;
    activePointOutlineColor?: string;
    pointOutlineWidth?: number;
    axisLineColor?: string;
    axisLineWidth?: number;
    keepBoxAboveGround?: boolean;
    cursor?: string;
    activeBox?: boolean;
    activeScalePointIndex?: number; // 0 ~ 11
    activeEdgeIndex?: number; // 0 ~ 11
  };
};

const Box: React.FC<PrimitiveProps<Property>> = memo(function BoxPresenter({ layer }) {
  const { viewer } = useCesium();
  const ctx = useContext();
  const { id, isVisible, property } = layer ?? {};
  const {
    fillColor,
    outlineColor,
    activeOutlineColor,
    outlineWidth,
    draggableOutlineColor,
    activeDraggableOutlineColor,
    draggableOutlineWidth,
    height = 100,
    width = 100,
    length = 100,
    pointFillColor,
    pointOutlineColor,
    activePointOutlineColor,
    pointOutlineWidth,
    axisLineColor,
    axisLineWidth,
    keepBoxAboveGround,
    scalePoint = true,
    axisLine = true,
    cursor,
    activeBox,
    activeEdgeIndex,
    activeScalePointIndex,
  } = property?.default ?? {};

  const [terrainHeightEstimate, setTerrainHeightEstimate] = useState(0);
  const [trs] = useState(() =>
    updateTrs(new TranslationRotationScale(), property, terrainHeightEstimate),
  );

  const isProgressSamplingTerrainHeight = useRef(false);
  const updateTerrainHeight = useCallback(() => {
    if (isProgressSamplingTerrainHeight.current) {
      return;
    }

    isProgressSamplingTerrainHeight.current = true;
    if (keepBoxAboveGround) {
      sampleTerrainHeight(viewer.scene, trs.translation).then(v => {
        setTerrainHeightEstimate(v ?? 0);
        isProgressSamplingTerrainHeight.current = false;
      });
    }
  }, [keepBoxAboveGround, viewer, trs]);

  useEffect(() => {
    updateTrs(trs, property, terrainHeightEstimate);
    if (keepBoxAboveGround) {
      updateTerrainHeight();
    }
  }, [property, trs, viewer, terrainHeightEstimate, updateTerrainHeight, keepBoxAboveGround]);

  const style = useMemo(
    () => ({
      fillColor: toColor(fillColor),
      outlineColor: toColor(outlineColor),
      activeOutlineColor: toColor(activeOutlineColor),
      draggableOutlineColor: toColor(draggableOutlineColor),
      activeDraggableOutlineColor: toColor(activeDraggableOutlineColor),
      outlineWidth,
      draggableOutlineWidth,
      fill: !!fillColor,
      outline: !!outlineColor,
    }),
    [
      fillColor,
      outlineColor,
      activeOutlineColor,
      outlineWidth,
      draggableOutlineWidth,
      draggableOutlineColor,
      activeDraggableOutlineColor,
    ],
  );

  const scalePointStyle = useMemo(
    () => ({
      pointFillColor: toColor(pointFillColor) ?? style.fillColor,
      pointOutlineColor: toColor(pointOutlineColor) ?? style.outlineColor,
      activePointOutlineColor: toColor(activePointOutlineColor) ?? style.outlineColor,
      axisLineColor: toColor(axisLineColor) ?? style.outlineColor,
    }),
    [pointFillColor, pointOutlineColor, axisLineColor, style, activePointOutlineColor],
  );

  // ScalePoint event handlers
  const currentPointIndex = useRef<number>();
  const handlePointMouseDown: PointEventCallback = useCallback((_, { index }) => {
    currentPointIndex.current = index;
  }, []);
  const prevMousePosition2dForPoint = useRef<Cartesian2>();
  const handlePointMouseMove: PointEventCallback = useCallback(
    (e, { position, oppositePosition, pointLocal, index }) => {
      if (currentPointIndex.current !== index || !position || !oppositePosition || !pointLocal) {
        return;
      }
      if (prevMousePosition2dForPoint.current === undefined) {
        prevMousePosition2dForPoint.current = new Cartesian2(e.x, e.y);
        return;
      }

      const currentMousePosition2d = new Cartesian2(e.x, e.y);

      const axisVector = Cartesian3.subtract(position, oppositePosition, new Cartesian3());
      const length = Cartesian3.magnitude(axisVector);
      const scaleDirection = Cartesian3.normalize(axisVector, new Cartesian3());

      const { scaleAmount, pixelLengthAfterScaling } = computeMouseMoveAmount(
        viewer.scene,
        {
          startPosition: prevMousePosition2dForPoint.current,
          endPosition: currentMousePosition2d,
        },
        position,
        scaleDirection,
        length,
      );

      prevMousePosition2dForPoint.current = currentMousePosition2d.clone();

      const axisLocal = Cartesian3.normalize(pointLocal, new Cartesian3());
      const xDot = Math.abs(Cartesian3.dot(new Cartesian3(1, 0, 0), axisLocal));
      const yDot = Math.abs(Cartesian3.dot(new Cartesian3(0, 1, 0), axisLocal));
      const zDot = Math.abs(Cartesian3.dot(new Cartesian3(0, 0, 1), axisLocal));

      const isProportionalScaling = xDot && yDot && zDot;

      // When downscaling, stop at 20px length.
      if (scaleAmount < 0) {
        const isDiagonal = axisLocal.x && axisLocal.y && axisLocal.y;
        const pixelSideLengthAfterScaling = isDiagonal
          ? pixelLengthAfterScaling / Math.sqrt(2)
          : pixelLengthAfterScaling;
        if (pixelSideLengthAfterScaling < 20) {
          // Do nothing if scaling down will make the box smaller than 20px
          return;
        }
      }

      // Compute scale components along xyz
      const scaleStep = Cartesian3.multiplyByScalar(
        // Taking abs because scaling step is independent of axis direction
        // Scaling step is negative when scaling down and positive when scaling up
        Cartesian3.abs(
          // Extract scale components along the axis
          Cartesian3.multiplyComponents(
            trs.scale,
            // For proportional scaling we scale equally along xyz
            isProportionalScaling ? new Cartesian3(1, 1, 1) : axisLocal,
            new Cartesian3(),
          ),
          new Cartesian3(),
        ),
        scaleAmount,
        new Cartesian3(),
      );

      // Move the box by half the scale amount in the direction of scaling so
      // that the opposite end remains stationary.
      const moveStep = Cartesian3.multiplyByScalar(axisVector, scaleAmount / 2, new Cartesian3());

      // Prevent scaling in Z axis if it will result in the box going underground.
      const isDraggingBottomScalePoint = axisLocal.z < 0;
      const isUpscaling = scaleAmount > 0;
      if (keepBoxAboveGround && isUpscaling && isDraggingBottomScalePoint) {
        const boxCenterHeight = Cartographic.fromCartesian(
          trs.translation,
          undefined,
          new Cartographic(),
        ).height;
        const bottomHeight = boxCenterHeight - trs.scale.z / 2;
        const bottomHeightAfterScaling = bottomHeight - Math.abs(moveStep.z);
        if (bottomHeightAfterScaling < 0) {
          scaleStep.z = 0;
        }
      }

      const nextScale = new Cartesian3();
      const nextTranslation = new Cartesian3();

      Cartesian3.add(trs.scale, scaleStep, nextScale);
      Cartesian3.add(trs.translation, moveStep, nextTranslation);

      const cartographic = viewer?.scene.globe.ellipsoid.cartesianToCartographic(
        nextTranslation,
      ) as Cartographic;

      ctx?.emit("boxscale", {
        width: nextScale.x,
        length: nextScale.y,
        height: nextScale.z,
        location: {
          lat: CesiumMath.toDegrees(cartographic?.latitude),
          lng: CesiumMath.toDegrees(cartographic?.longitude),
          height: cartographic?.height,
        },
      });
    },
    [trs, viewer, keepBoxAboveGround, ctx],
  );
  const handlePointMouseUp: PointEventCallback = useCallback(() => {
    currentPointIndex.current = undefined;
    prevMousePosition2dForPoint.current = undefined;
  }, []);

  // Edge event handlers
  const currentEdgeIndex = useRef<number>();
  const handleEdgeMouseDown: EdgeEventCallback = useCallback((_, { index }) => {
    currentEdgeIndex.current = index;
  }, []);
  const prevMouseXAxisForEdge = useRef<number>();
  const handleEdgeMouseMove: EdgeEventCallback = useCallback(
    (e, { index }) => {
      if (currentEdgeIndex.current !== index) {
        return;
      }
      if (prevMouseXAxisForEdge.current === undefined) {
        prevMouseXAxisForEdge.current = e.x;
        return;
      }
      const dx = e.x - prevMouseXAxisForEdge.current;
      prevMouseXAxisForEdge.current = e.x;
      const sensitivity = 0.05;
      const hpr = new HeadingPitchRoll(0, 0, 0);
      // -dx because the screen coordinates is opposite to local coordinates space.
      hpr.heading = -dx * sensitivity;
      hpr.pitch = 0;
      hpr.roll = 0;

      const nextRotation = new Quaternion();

      Quaternion.multiply(trs.rotation, Quaternion.fromHeadingPitchRoll(hpr), nextRotation);

      const { heading, pitch, roll } = HeadingPitchRoll.fromQuaternion(nextRotation);

      ctx?.emit("boxrotate", {
        heading,
        pitch,
        roll,
      });
    },
    [trs, ctx],
  );
  const handleEdgeMouseUp: EdgeEventCallback = useCallback(() => {
    currentEdgeIndex.current = undefined;
    prevMouseXAxisForEdge.current = undefined;
  }, []);

  useEffect(() => {
    document.body.style.cursor = cursor || "default";
  }, [cursor]);

  return !isVisible ? null : (
    <>
      {SIDE_PLANES.map((plane, i) => (
        <Side
          key={`${id}-plane-${SIDE_PLANE_NAMES[i]}`}
          id={`${id}-plane-${SIDE_PLANE_NAMES[i]}`}
          planeLocal={plane}
          fill={style.fill}
          fillColor={style.fillColor}
          outlineColor={style.outlineColor}
          isActive={!!activeBox}
          activeOutlineColor={style.activeOutlineColor}
          trs={trs}
        />
      ))}
      {BOX_EDGES.map((edge, i) => {
        return (
          <Edge
            key={`${id}-edge-${i}`}
            id={`${id}-edge${edge.isDraggable ? `-draggable` : ""}-${i}`}
            index={i}
            edge={edge}
            isHovered={activeEdgeIndex === i || (!edge.isDraggable && !!activeBox)}
            width={edge.isDraggable ? style.draggableOutlineWidth : style.outlineWidth}
            fillColor={edge.isDraggable ? style.draggableOutlineColor : style.outlineColor}
            hoverColor={
              edge.isDraggable ? style.activeDraggableOutlineColor : style.activeOutlineColor
            }
            trs={trs}
            onMouseDown={edge.isDraggable ? handleEdgeMouseDown : undefined}
            onMouseMove={edge.isDraggable ? handleEdgeMouseMove : undefined}
            onMouseUp={edge.isDraggable ? handleEdgeMouseUp : undefined}
          />
        );
      })}
      {scalePoint &&
        SCALE_POINTS.map((vector, i) => (
          <ScalePoints
            key={`${id}-scale-point-${i}`}
            id={`${id}-scale-point`}
            index={i}
            scalePoint={vector}
            trs={trs}
            isHovered={activeScalePointIndex === i}
            pointFillColor={scalePointStyle.pointFillColor}
            pointOutlineColor={scalePointStyle.pointOutlineColor}
            hoverPointOutlineColor={scalePointStyle.activePointOutlineColor}
            pointOutlineWidth={pointOutlineWidth}
            axisLineColor={scalePointStyle.axisLineColor}
            axisLineWidth={axisLineWidth}
            dimensions={{ width: width * 0.05, height: height * 0.05, length: length * 0.05 }}
            visiblePoint={scalePoint}
            visibleAxisLine={axisLine && activeScalePointIndex === i}
            onPointMouseDown={handlePointMouseDown}
            onPointMouseMove={handlePointMouseMove}
            onPointMouseUp={handlePointMouseUp}
          />
        ))}
    </>
  );
});

export default Box;
