import { Cartesian3 } from "cesium";
import { isEqual } from "lodash";
import React, { useMemo } from "react";
import { PolylineGraphics, Entity } from "resium";
import { useCustomCompareMemo } from "use-custom-compare";

import { Coordinates, toColor } from "@reearth/util/value";

import type { Props as PrimitiveProps } from "../../../../Layers/Primitive";
import { shadowMode } from "../../common";

export type Props = PrimitiveProps<Property>;

export type Property = {
  coordinates?: Coordinates;
  clampToGround?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  shadows?: "disabled" | "enabled" | "cast_only" | "receive_only";
};

const Polyline: React.FC<PrimitiveProps<Property>> = ({ id, isVisible, property, geometry }) => {
  const coordinates = useMemo(
    () =>
      geometry?.type === "LineString"
        ? geometry.coordinates
        : property.coordinates
        ? property.coordinates.map(p => [p.lng, p.lat, p.height])
        : undefined,
    [geometry?.coordinates, geometry?.type, property.coordinates],
  );

  const { clampToGround, strokeColor, strokeWidth = 1, shadows } = property ?? {};

  const positions = useCustomCompareMemo(
    () => coordinates?.map(c => Cartesian3.fromDegrees(c[0], c[1], c[2])),
    [coordinates ?? []],
    isEqual,
  );
  const material = useMemo(() => toColor(strokeColor), [strokeColor]);

  return !isVisible ? null : (
    <Entity id={id}>
      <PolylineGraphics
        positions={positions}
        width={strokeWidth}
        material={material}
        clampToGround={clampToGround}
        shadows={shadowMode(shadows)}
      />
    </Entity>
  );
};

export default Polyline;
