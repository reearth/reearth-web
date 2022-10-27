/* eslint-disable react-hooks/exhaustive-deps */
import {
  Axis,
  CallbackProperty,
  Cartesian2,
  Cartesian3,
  Color,
  Matrix4,
  Plane as CesiumPlane,
  PositionProperty,
  TranslationRotationScale,
} from "cesium";
import React, { useMemo, FC, useEffect, memo, useState } from "react";
import { Entity, PlaneGraphics } from "resium";

import { LatLng, toColor } from "@reearth/util/value";

import type { Props as PrimitiveProps } from "../../../Primitive";

export type Props = PrimitiveProps<Property>;

export type BoxStyle<C = Color | string> = {
  fillColor?: C;
  outlineColor?: C;
  outlineWidth?: number;
  fill?: boolean;
  outline?: boolean;
};

export type Property = {
  default?: {
    position?: LatLng;
    location?: LatLng;
    height?: number;
    dimensions?: {
      x: number;
      y: number;
      z: number;
    };
    /**
     * Position on screen like mouse position.
     */
    screen?: {
      x: number;
      y: number;
    };
  } & BoxStyle<string>;
};

// ref: https://github.com/TerriaJS/terriajs/blob/cad62a45cbee98c7561625458bec3a48510f6cbc/lib/Models/BoxDrawing.ts#L1446-L1461
function setPlaneDimensions(
  boxDimensions: Cartesian3,
  planeNormalAxis: Axis,
  planeDimensions: Cartesian2,
) {
  if (planeNormalAxis === Axis.X) {
    planeDimensions.x = boxDimensions.y;
    planeDimensions.y = boxDimensions.z;
  } else if (planeNormalAxis === Axis.Y) {
    planeDimensions.x = boxDimensions.x;
    planeDimensions.y = boxDimensions.z;
  } else if (planeNormalAxis === Axis.Z) {
    planeDimensions.x = boxDimensions.x;
    planeDimensions.y = boxDimensions.y;
  }
}

const Side: FC<{
  id: string;
  planeLocal: CesiumPlane;
  trs: TranslationRotationScale;
  style: BoxStyle<Color>;
}> = memo(
  function SidePresenter({ id, planeLocal, style, trs }) {
    const normalAxis = planeLocal.normal.x ? Axis.X : planeLocal.normal.y ? Axis.Y : Axis.Z;
    const cbRef = useMemo(
      () => new CallbackProperty(() => trs.translation, false) as unknown as PositionProperty,
      [trs],
    );
    const [plane, dimension] = useMemo(() => {
      const dimension = new Cartesian3();
      setPlaneDimensions(trs.scale, normalAxis, dimension);
      const scratchScaleMatrix = new Matrix4();
      const scaleMatrix = Matrix4.fromScale(trs.scale, scratchScaleMatrix);
      const plane = CesiumPlane.transform(
        planeLocal,
        scaleMatrix,
        new CesiumPlane(Cartesian3.UNIT_Z, 0),
      );
      return [plane, dimension];
    }, [trs.scale]);

    return (
      <Entity id={id} position={cbRef}>
        <PlaneGraphics
          plane={plane}
          dimensions={dimension}
          fill={style.fill}
          outline={style.outline}
          material={style.fillColor}
          outlineColor={style.outlineColor}
          outlineWidth={style.outlineWidth}
        />
      </Entity>
    );
  },
  () => true,
);

// The 6 box sides defined as planes in local coordinate space.
// ref: https://github.com/TerriaJS/terriajs/blob/cad62a45cbee98c7561625458bec3a48510f6cbc/lib/Models/BoxDrawing.ts#L161-L169
const SIDE_PLANES: readonly CesiumPlane[] = [
  new CesiumPlane(new Cartesian3(0, 0, 1), 0.5),
  new CesiumPlane(new Cartesian3(0, 0, -1), 0.5),
  new CesiumPlane(new Cartesian3(0, 1, 0), 0.5),
  new CesiumPlane(new Cartesian3(0, -1, 0), 0.5),
  new CesiumPlane(new Cartesian3(1, 0, 0), 0.5),
  new CesiumPlane(new Cartesian3(-1, 0, 0), 0.5),
];

// This is used for plane ID.
// We can use this name, for example you want to move the box when front plane is dragged.
const SIDE_PLANE_NAMES = ["bottom", "top", "front", "back", "left", "right"];

const updateTrs = (trs: TranslationRotationScale, property: Property | undefined) => {
  const { position, location, height, dimensions } = property?.default ?? {};

  const pos = position || location;
  const translation = pos ? Cartesian3.fromDegrees(pos.lng, pos.lat, height ?? 0) : undefined;
  if (translation) {
    Cartesian3.clone(translation, trs.translation);
  }

  // Quaternion.clone(trs.rotation, this.trs.rotation);

  Cartesian3.clone(
    new Cartesian3(dimensions?.x || 100, dimensions?.y || 100, dimensions?.z || 100),
    trs.scale,
  );

  return trs;
};

const Box: React.FC<PrimitiveProps<Property>> = memo(function BoxPresenter({ layer }) {
  const { id, isVisible, property } = layer ?? {};
  const { fillColor, outlineColor, outlineWidth, fill, outline } = property?.default ?? {};

  const [trs] = useState(() => updateTrs(new TranslationRotationScale(), property));
  useEffect(() => {
    updateTrs(trs, property);
  }, [property?.default?.position, property?.default?.location, property?.default?.height, property?.default?.dimensions, property?.default?.dimensions?.y, property?.default?.dimensions?.z]);

  const style: BoxStyle<Color> = useMemo(
    () => ({
      fillColor: toColor(fillColor),
      outlineColor: toColor(outlineColor),
      outlineWidth,
      fill,
      outline,
    }),
    [fillColor, outlineColor, outlineWidth, fill],
  );

  return !isVisible ? null : (
    <>
      {SIDE_PLANES.map((plane, i) => (
        <Side
          key={`${id}-plane-${SIDE_PLANE_NAMES[i]}`}
          id={`${id}-plane-${SIDE_PLANE_NAMES[i]}`}
          planeLocal={plane}
          style={style}
          trs={trs}
        />
      ))}
    </>
  );
});

export default Box;
