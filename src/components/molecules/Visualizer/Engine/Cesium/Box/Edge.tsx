import {
  ArcType,
  CallbackProperty,
  Cartesian3,
  Color,
  ColorMaterialProperty,
  Matrix4,
  TranslationRotationScale,
} from "cesium";
import { FC, memo, useCallback, useEffect, useRef, useState } from "react";
import { Entity, PolylineGraphics } from "resium";

import { EventCallback } from "@reearth/util/event";

import { useContext } from "../../../Plugin";

export type EdgeEventCallback = EventCallback<
  [
    event: any,
    edgeEvent: {
      index: number;
    },
  ]
>;

export type EdgeProperties = { start: Cartesian3; end: Cartesian3; isDraggable?: boolean };

type Props = {
  id: string;
  index: number;
  edge: EdgeProperties;
  trs: TranslationRotationScale;
  isHovered: boolean;
  fillColor?: Color;
  hoverColor?: Color;
  width?: number;
  onMouseDown?: EdgeEventCallback;
  onMouseMove?: EdgeEventCallback;
  onMouseUp?: EdgeEventCallback;
  onMouseEnter?: EdgeEventCallback;
  onMouseLeave?: EdgeEventCallback;
};

export const Edge: FC<Props> = memo(function EdgePresenter({
  id,
  index,
  edge,
  isHovered,
  fillColor,
  trs,
  width,
  hoverColor,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}) {
  const ctx = useContext();
  const [cbp] = useState(
    () =>
      new CallbackProperty(() => {
        const position1 = new Cartesian3();
        const position2 = new Cartesian3();
        const matrix = Matrix4.fromTranslationRotationScale(trs);
        Matrix4.multiplyByPoint(matrix, edge.start, position1);
        Matrix4.multiplyByPoint(matrix, edge.end, position2);
        return [position1, position2];
      }, false),
  );

  const isEdgeHovered = useRef(false);
  const [outlineColor] = useState(
    () =>
      new ColorMaterialProperty(
        new CallbackProperty(
          () => (isEdgeHovered.current ? hoverColor ?? fillColor : fillColor),
          false,
        ),
      ),
  );
  useEffect(() => {
    isEdgeHovered.current = isHovered;
  }, [isHovered]);

  const handleMouseDown: EventCallback = useCallback(
    e => {
      if (e.layerId !== id) {
        return;
      }
      onMouseDown?.(e, { index });
    },
    [onMouseDown, id, index],
  );

  const handleMouseMove: EventCallback = useCallback(
    e => {
      onMouseMove?.(e, { index });
    },
    [onMouseMove, index],
  );

  const handleMouseUp: EventCallback = useCallback(
    e => {
      onMouseUp?.(e, { index });
    },
    [onMouseUp, index],
  );

  useEffect(() => {
    ctx?.reearth.on("mousedown", handleMouseDown);
    ctx?.reearth.on("mousemove", handleMouseMove);
    ctx?.reearth.on("mouseup", handleMouseUp);
    return () => {
      ctx?.reearth.off("mousedown", handleMouseDown);
      ctx?.reearth.off("mousemove", handleMouseMove);
      ctx?.reearth.off("mouseup", handleMouseUp);
    };
  }, [ctx, handleMouseDown, handleMouseMove, handleMouseUp]);

  return (
    <Entity id={id}>
      <PolylineGraphics
        positions={cbp}
        width={width}
        material={outlineColor}
        arcType={ArcType.NONE}
      />
    </Entity>
  );
});