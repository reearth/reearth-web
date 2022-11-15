import {
  Axis,
  CallbackProperty,
  Cartesian3,
  Color,
  Matrix4,
  Plane as CesiumPlane,
  PositionProperty,
  TranslationRotationScale,
} from "cesium";
import { useMemo, FC, memo, useRef, useState, useEffect } from "react";
import { Entity, PlaneGraphics } from "resium";

import { setPlaneDimensions } from "./utils";

export const Side: FC<{
  id: string;
  planeLocal: CesiumPlane;
  isActive: boolean;
  trs: TranslationRotationScale;
  fillColor?: Color;
  outlineColor?: Color;
  activeOutlineColor?: Color;
  fill?: boolean;
}> = memo(function SidePresenter({
  id,
  planeLocal,
  isActive,
  fill,
  fillColor,
  outlineColor,
  activeOutlineColor,
  trs,
}) {
  const cbRef = useMemo(
    () => new CallbackProperty(() => trs.translation, false) as unknown as PositionProperty,
    [trs],
  );
  const [plane, dimension, orientation] = useMemo(() => {
    return [
      new CallbackProperty(() => {
        const scratchScaleMatrix = new Matrix4();
        const scaleMatrix = Matrix4.fromScale(trs.scale, scratchScaleMatrix);
        return CesiumPlane.transform(
          planeLocal,
          scaleMatrix,
          new CesiumPlane(Cartesian3.UNIT_Z, 0),
        );
      }, false),
      new CallbackProperty(() => {
        const normalAxis = planeLocal.normal.x ? Axis.X : planeLocal.normal.y ? Axis.Y : Axis.Z;
        const dimension = new Cartesian3();
        setPlaneDimensions(trs.scale, normalAxis, dimension);
        return dimension;
      }, false),
      new CallbackProperty(() => trs.rotation, false),
    ];
  }, [trs, planeLocal]);

  const isActiveRef = useRef(false);
  const [outlineColorCb] = useState(
    () =>
      new CallbackProperty(
        () => (isActiveRef.current ? activeOutlineColor ?? outlineColor : outlineColor),
        false,
      ),
  );
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  return (
    <Entity id={id} position={cbRef} orientation={orientation}>
      <PlaneGraphics
        plane={plane}
        dimensions={dimension}
        fill={fill}
        material={fillColor}
        outlineWidth={1}
        outlineColor={outlineColorCb}
        outline
      />
    </Entity>
  );
});
