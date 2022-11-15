import {
  ArcType,
  CallbackProperty,
  Cartesian3,
  Color,
  JulianDate,
  Matrix4,
  PolylineDashMaterialProperty,
  PositionProperty,
  Quaternion,
  TranslationRotationScale,
} from "cesium";
import { FC, memo, useCallback, useMemo, useState, useEffect, useRef } from "react";
import { BoxGraphics, Entity, PolylineGraphics } from "resium";

import { EventCallback } from "@reearth/util/event";

import { useContext } from "../../../Plugin";

export type ScalePointProperties = {
  point: Cartesian3;
  oppositePoint: Cartesian3;
};

export type PointEventCallback = EventCallback<
  [
    event: any,
    pointEvent: {
      index: number;
      opposite: boolean;
      position?: Cartesian3;
      oppositePosition?: Cartesian3;
      pointLocal?: Cartesian3;
    },
  ]
>;

type Props = {
  id: string;
  index: number;
  scalePoint: ScalePointProperties;
  trs: TranslationRotationScale;
  isHovered: boolean;
  pointFillColor?: Color;
  pointOutlineColor?: Color;
  hoverPointOutlineColor?: Color;
  pointOutlineWidth?: number;
  axisLineColor?: Color;
  axisLineWidth?: number;
  dimensions?: { width: number; height: number; length: number };
  visiblePoint?: boolean;
  visibleAxisLine?: boolean;
  onPointMouseDown?: PointEventCallback;
  onPointMouseMove?: PointEventCallback;
  onPointMouseUp?: PointEventCallback;
};

export const ScalePoints: FC<Props> = memo(function ScalePointsPresenter({
  id,
  index,
  scalePoint,
  isHovered,
  pointFillColor,
  pointOutlineColor,
  hoverPointOutlineColor,
  pointOutlineWidth,
  axisLineColor,
  axisLineWidth,
  trs,
  dimensions,
  visiblePoint,
  visibleAxisLine,
  onPointMouseDown,
  onPointMouseMove,
  onPointMouseUp,
}) {
  const ctx = useContext();

  const [entitiesPosition] = useState(() => {
    const point = new Cartesian3();
    const oppositePoint = new Cartesian3();

    const pointProperty = new CallbackProperty(() => {
      const matrix = Matrix4.fromTranslationRotationScale(trs);
      Matrix4.multiplyByPoint(matrix, scalePoint.point, point);
      return point;
    }, false) as unknown as PositionProperty;
    const oppositePointProperty = new CallbackProperty(() => {
      const matrix = Matrix4.fromTranslationRotationScale(trs);
      Matrix4.multiplyByPoint(matrix, scalePoint.oppositePoint, oppositePoint);
      return oppositePoint;
    }, false) as unknown as PositionProperty;

    return {
      point: pointProperty,
      oppositePoint: oppositePointProperty,
      axisLine: new CallbackProperty(
        () => [
          pointProperty.getValue(JulianDate.now()),
          oppositePointProperty.getValue(JulianDate.now()),
        ],
        false,
      ),
    };
  });

  const isScalePointHovered = useRef(false);
  const [pointOutlineColorCb] = useState(
    () =>
      new CallbackProperty(
        () => (isScalePointHovered.current ? hoverPointOutlineColor : pointOutlineColor),
        false,
      ),
  );
  useEffect(() => {
    isScalePointHovered.current = isHovered;
  }, [isHovered]);

  const [cesiumDimensions] = useState(
    () => new Cartesian3(dimensions?.width, dimensions?.length, dimensions?.height),
  );
  const [cesiumDimensionsCallbackProperty] = useState(
    () => new CallbackProperty(() => cesiumDimensions, false),
  );
  const [orientation] = useState(() => new CallbackProperty(() => Quaternion.IDENTITY, false));
  const axisColorProperty = useMemo(
    () => new PolylineDashMaterialProperty({ color: axisLineColor, dashLength: 8 }),
    [axisLineColor],
  );

  const isOppositePointClicked = useRef(false);
  const handlePointMouseDown: EventCallback = useCallback(
    e => {
      isOppositePointClicked.current = e.layerId === `${id}-opposite-${index}`;
      if (e.layerId === `${id}-${index}` || e.layerId === `${id}-opposite-${index}`) {
        onPointMouseDown?.(e, {
          index,
          opposite: isOppositePointClicked.current,
        });
      }
    },
    [onPointMouseDown, index, id],
  );
  const handlePointMouseMove: EventCallback = useCallback(
    e => {
      onPointMouseMove?.(e, {
        index,
        opposite: isOppositePointClicked.current,
        position: isOppositePointClicked.current
          ? entitiesPosition.oppositePoint.getValue(JulianDate.now())
          : entitiesPosition.point.getValue(JulianDate.now()),
        oppositePosition: isOppositePointClicked.current
          ? entitiesPosition.point.getValue(JulianDate.now())
          : entitiesPosition.oppositePoint.getValue(JulianDate.now()),
        pointLocal: isOppositePointClicked ? scalePoint.oppositePoint : scalePoint.point,
      });
    },
    [onPointMouseMove, index, entitiesPosition, scalePoint],
  );
  const handlePointMouseUp: EventCallback = useCallback(
    e => {
      onPointMouseUp?.(e, {
        index,
        opposite: isOppositePointClicked.current,
      });
    },
    [onPointMouseUp, index],
  );

  useEffect(() => {
    Cartesian3.clone(
      new Cartesian3(dimensions?.width, dimensions?.length, dimensions?.height),
      cesiumDimensions,
    );
  }, [dimensions, cesiumDimensions]);

  useEffect(() => {
    ctx?.reearth.on("mousedown", handlePointMouseDown);
    ctx?.reearth.on("mousemove", handlePointMouseMove);
    ctx?.reearth.on("mouseup", handlePointMouseUp);

    return () => {
      ctx?.reearth.off("mousedown", handlePointMouseDown);
      ctx?.reearth.off("mousemove", handlePointMouseMove);
      ctx?.reearth.off("mouseup", handlePointMouseUp);
    };
  }, [ctx, handlePointMouseDown, handlePointMouseMove, handlePointMouseUp]);

  return (
    <>
      <Entity id={`${id}-${index}`} position={entitiesPosition.point} orientation={orientation}>
        <BoxGraphics
          show={visiblePoint}
          dimensions={cesiumDimensionsCallbackProperty}
          material={pointFillColor}
          fill={!!pointFillColor}
          outline={!!pointOutlineColor}
          outlineColor={pointOutlineColorCb}
          outlineWidth={pointOutlineWidth}
        />
      </Entity>
      <Entity
        id={`${id}-opposite-${index}`}
        position={entitiesPosition.oppositePoint}
        orientation={orientation}>
        <BoxGraphics
          show={visiblePoint}
          dimensions={cesiumDimensions}
          material={pointFillColor}
          fill={!!pointFillColor}
          outline={!!pointOutlineColor}
          outlineColor={pointOutlineColorCb}
          outlineWidth={pointOutlineWidth}
        />
      </Entity>
      <Entity id={`${id}-axis-line-${index}`}>
        <PolylineGraphics
          positions={entitiesPosition.axisLine}
          show={visibleAxisLine}
          material={axisColorProperty}
          width={axisLineWidth}
          arcType={ArcType.NONE}
        />
      </Entity>
    </>
  );
});
